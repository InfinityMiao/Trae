<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">反馈管理</h1>
        <p class="page-desc">查看并处理员工提交的问题反馈</p>
      </div>
      <div class="filters">
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 140px" @change="loadFeedbacks">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已处理" value="resolved" />
        </el-select>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="feedbacks" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="employee_name" label="提交人" width="120" />
        <el-table-column prop="category_name" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 'processing'" type="primary">处理中</el-tag>
            <el-tag v-else type="success">已处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="right">
          <template #default="{ row }">
            <el-button size="small" text @click="viewDetail(row.id)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button size="small" text type="primary" @click="openReply(row.id)">
              <el-icon><ChatDotRound /></el-icon>回复
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadFeedbacks"
        class="pagination"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="反馈详情" width="600px" class="custom-dialog">
      <div v-if="detail" class="detail-content">
        <h4 class="detail-title">{{ detail.feedback?.title }}</h4>
        <p class="detail-meta">
          提交人：{{ detail.feedback?.employee_name }} | 时间：{{ formatDate(detail.feedback?.created_at) }}
        </p>
        <el-divider />
        <p class="detail-body">{{ detail.feedback?.content }}</p>
        <div v-if="detail.attachments && detail.attachments.length > 0">
          <el-divider />
          <h4 class="detail-section-title">附件</h4>
          <div v-for="att in detail.attachments" :key="att.id" class="attachment-item">
            <el-link type="primary" :href="att.file_url" target="_blank">{{ att.file_name }}</el-link>
          </div>
        </div>
        <div v-if="detail.replies && detail.replies.length > 0">
          <el-divider />
          <h4 class="detail-section-title">回复记录</h4>
          <div v-for="reply in detail.replies" :key="reply.id" class="reply-item">
            <div class="reply-header">
              <span class="reply-author">{{ reply.employee_name }}</span>
              <span class="reply-time">{{ formatDate(reply.created_at) }}</span>
            </div>
            <p class="reply-body">{{ reply.content }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="replyVisible" title="回复反馈" width="500px" class="custom-dialog">
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="请输入回复内容"
      />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" class="btn-primary" @click="submitReply" :loading="replyLoading">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

const feedbacks = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filterStatus = ref('');

const detailVisible = ref(false);
const detail = ref<any>(null);

const replyVisible = ref(false);
const replyContent = ref('');
const replyLoading = ref(false);
const currentFeedbackId = ref<number | null>(null);

onMounted(() => {
  loadFeedbacks();
});

async function loadFeedbacks() {
  loading.value = true;
  try {
    const params: any = { page: page.value, pageSize: pageSize.value };
    if (filterStatus.value) params.status = filterStatus.value;
    const res: any = await request.post('/feedbackService.adminList', params);
    if (res.code === 200) {
      feedbacks.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function viewDetail(id: number) {
  try {
    const res: any = await request.post('/feedbackService.getDetail', { id });
    if (res.code === 200) {
      detail.value = res.data;
      detailVisible.value = true;
    }
  } catch (e) {
    console.error(e);
  }
}

function openReply(id: number) {
  currentFeedbackId.value = id;
  replyContent.value = '';
  replyVisible.value = true;
}

async function submitReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  replyLoading.value = true;
  try {
    const res: any = await request.post('/feedbackService.reply', {
      feedback_id: currentFeedbackId.value,
      content: replyContent.value,
    });
    if (res.code === 200) {
      ElMessage.success('回复成功');
      replyVisible.value = false;
      loadFeedbacks();
    } else {
      ElMessage.error(res.message || '回复失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('回复失败');
  } finally {
    replyLoading.value = false;
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
.filters {
  display: flex;
  gap: 12px;
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
.pagination {
  padding: 16px 20px;
  justify-content: flex-end;
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
.detail-content {
  color: var(--color-text);
}
.detail-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}
.detail-meta {
  color: var(--color-text-secondary);
  font-size: 13px;
  margin: 0;
}
.detail-body {
  line-height: 1.7;
  margin: 0;
}
.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}
.attachment-item {
  margin-bottom: 8px;
}
.reply-item {
  padding: 16px;
  background: var(--color-background);
  border-radius: 12px;
  margin-bottom: 12px;
}
.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.reply-author {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}
.reply-time {
  color: var(--color-text-muted);
  font-size: 12px;
}
.reply-body {
  margin: 0;
  color: var(--color-text-tertiary);
  line-height: 1.6;
}
</style>
