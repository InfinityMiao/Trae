<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">常见问题管理</h1>
        <p class="page-desc">管理员工常见问题与解答内容</p>
      </div>
      <el-button type="primary" class="btn-primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增 FAQ
      </el-button>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="faqs" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="question" label="问题" show-overflow-tooltip />
        <el-table-column prop="answer" label="答案" show-overflow-tooltip />
        <el-table-column prop="sort_order" label="排序" width="80" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑FAQ' : '新增FAQ'" width="600px" class="custom-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
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

const faqs = ref<any[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<any>(null);
const form = ref({ id: 0, question: '', answer: '', sort_order: 0 });
const rules = {
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案', trigger: 'blur' }],
};
const submitting = ref(false);

onMounted(() => {
  loadFaqs();
});

async function loadFaqs() {
  loading.value = true;
  try {
    const res: any = await request.post('/faqService.adminList', {});
    if (res.code === 200) {
      faqs.value = res.data;
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
    form.value = { id: row.id, question: row.question, answer: row.answer, sort_order: row.sort_order };
  } else {
    isEdit.value = false;
    form.value = { id: 0, question: '', answer: '', sort_order: 0 };
  }
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const url = isEdit.value ? '/faqService.update' : '/faqService.create';
    const res: any = await request.post(url, form.value);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功');
      dialogVisible.value = false;
      loadFaqs();
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
    await ElMessageBox.confirm('确定删除该FAQ吗？', '提示', { type: 'warning' });
    const res: any = await request.post('/faqService.delete', { id });
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadFaqs();
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e);
    }
  }
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
