<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">岗位管理</h1>
        <p class="page-desc">管理企业组织架构中的岗位信息</p>
      </div>
      <div class="header-actions">
        <el-select v-model="filterDept" placeholder="选择部门" clearable @change="loadData" style="width: 200px">
          <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
        <el-button type="primary" class="btn-primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>创建岗位
        </el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="positions" stripe v-loading="loading">
        <el-table-column prop="name" label="岗位名称">
          <template #default="{ row }">
            <div class="pos-name">
              <div class="pos-icon">
                <el-icon :size="16" color="var(--color-primary)"><UserFilled /></el-icon>
              </div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="department_name" label="所属部门">
          <template #default="{ row }">
            <el-tag v-if="row.department_name" size="small" effect="plain" type="info">{{ row.department_name }}</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="employee_count" label="员工数" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="plain">{{ row.employee_count }} 人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑岗位' : '创建岗位'" width="400px" class="custom-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="所属部门" prop="department_id">
          <el-select v-model="form.department_id" placeholder="选择部门" style="width: 100%">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" class="btn-primary" @click="handleSubmit" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

const positions = ref<any[]>([]);
const departments = ref<any[]>([]);
const filterDept = ref<number | ''>('');
const showDialog = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const loading = ref(false);
const formRef = ref();
const form = ref({ id: null as number | null, name: '', department_id: null as number | null });
const formRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  department_id: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
};

async function loadData() {
  loading.value = true;
  try {
    const res: any = await request.post('/positionService.list', { department_id: filterDept.value || undefined });
    if (res.code === 200) {
      positions.value = res.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function loadDepartments() {
  const res: any = await request.post('/departmentService.list', {});
  if (res.code === 200) {
    departments.value = res.data;
  }
}

onMounted(() => {
  loadData();
  loadDepartments();
});

function handleEdit(row: any) {
  isEdit.value = true;
  form.value = { id: row.id, name: row.name, department_id: row.department_id };
  showDialog.value = true;
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该岗位吗？', '提示', { type: 'warning' });
    const res: any = await request.post('/positionService.delete', { id: row.id });
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadData();
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.message || '删除失败');
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  const api = isEdit.value ? '/positionService.update' : '/positionService.create';
  const res: any = await request.post(api, form.value);
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
    showDialog.value = false;
    form.value = { id: null, name: '', department_id: null };
    loadData();
  } else {
    ElMessage.error(res.message);
  }
  submitting.value = false;
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 6px 0 0;
}
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 600;
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}
.table-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
}
.table-card :deep(.el-card__body) {
  padding: 0;
}
.table-card :deep(.el-table__header th) {
  background: var(--color-background);
  font-weight: 600;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
.pos-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pos-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.text-muted {
  color: var(--color-text-muted);
}
.custom-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-divider);
  margin-right: 0;
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.custom-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--color-divider);
}
</style>
