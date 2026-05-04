<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">反馈类型管理</h1>
        <p class="page-desc">管理反馈问题的分类类型</p>
      </div>
      <el-button type="primary" class="btn-primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增类型
      </el-button>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="categories" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="类型名称" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openDialog(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑类型' : '新增类型'" width="400px" class="custom-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="btn-primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '@/utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const categories = ref<any[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<any>(null);
const form = ref({ id: 0, name: '' });
const rules = { name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }] };
const submitting = ref(false);

onMounted(() => {
  loadCategories();
});

async function loadCategories() {
  loading.value = true;
  try {
    const res: any = await request.post('/feedbackCategoryService.list', {});
    if (res.code === 200) {
      categories.value = res.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function openDialog(row?: any) {
  if (row) {
    isEdit.value = true;
    form.value = { id: row.id, name: row.name };
  } else {
    isEdit.value = false;
    form.value = { id: 0, name: '' };
  }
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const url = isEdit.value ? '/feedbackCategoryService.update' : '/feedbackCategoryService.create';
    const res: any = await request.post(url, form.value);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功');
      dialogVisible.value = false;
      loadCategories();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该类型吗？', '提示', { type: 'warning' });
    const res: any = await request.post('/feedbackCategoryService.delete', { id });
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadCategories();
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e);
    }
  }
}

function formatDate(d: string) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString();
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
