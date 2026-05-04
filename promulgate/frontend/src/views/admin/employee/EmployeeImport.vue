<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>批量导入员工</span>
          <el-button @click="downloadTemplate">下载模板</el-button>
        </div>
      </template>

      <el-upload
        drag
        action="/api/employeeService.import"
        :headers="{ Authorization: `Bearer ${authStore.token}` }"
        accept=".xlsx,.xls"
        :on-success="handleSuccess"
        :on-error="handleError"
        :show-file-list="false"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请使用Excel文件，格式参考模板
          </div>
        </template>
      </el-upload>

      <div v-if="result" style="margin-top: 20px">
        <el-alert :type="result.fail_count === 0 ? 'success' : 'warning'" :closable="false">
          <p>成功导入: {{ result.success_count }} 条</p>
          <p>失败: {{ result.fail_count }} 条</p>
        </el-alert>
        <el-table v-if="result.errors.length > 0" :data="result.errors" style="margin-top: 12px" border>
          <el-table-column prop="row" label="行号" width="80" />
          <el-table-column prop="reason" label="失败原因" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';

const authStore = useAuthStore();
const result = ref<any>(null);

function handleSuccess(res: any) {
  if (res.code === 200) {
    result.value = res.data;
    ElMessage.success('导入完成');
  } else {
    ElMessage.error(res.message);
  }
}

function handleError() {
  ElMessage.error('上传失败');
}

async function downloadTemplate() {
  try {
    const res = await request.post('/employeeService.importTemplate', {}, { responseType: 'blob' });
    const blob = new Blob([res as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employee_import_template.xlsx';
    link.click();
  } catch (e) {
    ElMessage.error('下载失败');
  }
}
</script>

<style scoped>
.page-header {
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
.content-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
}
.content-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-divider);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.upload-area :deep(.el-upload-dragger) {
  border-radius: 12px;
  border: 2px dashed var(--color-border);
  background: var(--color-surface-hover);
  transition: all 0.2s ease;
}
.upload-area :deep(.el-upload-dragger:hover) {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}
.result-alert {
  border-radius: 12px;
}
.error-table-card {
  border-radius: 12px;
  border: 1px solid var(--color-border);
}
.error-table-card :deep(.el-table__header th) {
  background: var(--color-background);
  font-weight: 600;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
</style>
