<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">部门管理</h1>
        <p class="page-desc">管理企业组织架构中的部门信息</p>
      </div>
      <el-button type="primary" class="btn-primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        创建部门
      </el-button>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="departments" stripe>
        <el-table-column prop="name" label="部门名称">
          <template #default="{ row }">
            <div class="dept-name">
              <div class="dept-icon">
                <el-icon :size="16" color="var(--color-primary)"><OfficeBuilding /></el-icon>
              </div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="position_count" label="岗位数" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.position_count }} 个岗位</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="employee_count" label="员工数" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="primary" effect="plain">{{ row.employee_count }} 人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="right">
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

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑部门' : '创建部门'" width="440px" class="custom-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
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

const departments = ref<any[]>([]);
const showDialog = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref();
const form = ref({ id: null as number | null, name: '' });
const formRules = { name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }] };

async function loadData() {
  const res: any = await request.post('/departmentService.list', {});
  if (res.code === 200) {
    departments.value = res.data;
  }
}

onMounted(loadData);

function handleEdit(row: any) {
  isEdit.value = true;
  form.value = { id: row.id, name: row.name };
  showDialog.value = true;
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该部门吗？', '提示', { type: 'warning' });
    const res: any = await request.post('/departmentService.delete', { id: row.id });
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
  const api = isEdit.value ? '/departmentService.update' : '/departmentService.create';
  const res: any = await request.post(api, form.value);
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
    showDialog.value = false;
    form.value = { id: null, name: '' };
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
.dept-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dept-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
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
