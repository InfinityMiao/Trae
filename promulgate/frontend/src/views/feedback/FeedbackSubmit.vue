<template>
  <div class="page-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo-icon-wrapper">
          <el-icon :size="24" color="#fff"><School /></el-icon>
        </div>
        <span class="logo-text">制度学习平台</span>
      </div>
      <div class="nav">
        <el-button text class="nav-btn" @click="$router.push('/')">
          <el-icon><HomeFilled /></el-icon>首页
        </el-button>
        <el-button text class="nav-btn" @click="$router.push('/regulations')">
          <el-icon><Document /></el-icon>制度学习
        </el-button>
        <el-button text class="nav-btn" @click="$router.push('/exams')">
          <el-icon><EditPen /></el-icon>考试
        </el-button>
        <el-button text class="nav-btn active">
          <el-icon><ChatDotRound /></el-icon>反馈
        </el-button>
        <el-button text class="nav-btn" @click="$router.push('/profile')">
          <el-icon><User /></el-icon>个人中心
        </el-button>
        <el-divider direction="vertical" />
        <el-button text class="nav-btn logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>退出
        </el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="page-header">
        <h1 class="page-title">问题反馈</h1>
        <p class="page-desc">提交您遇到的问题或建议</p>
      </div>

      <el-row :gutter="24">
        <el-col :xs="24" :lg="12">
          <el-card class="form-card" shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon :size="18" color="var(--color-primary)"><EditPen /></el-icon>
                <span class="section-title">提交问题反馈</span>
              </div>
            </template>

            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
              <el-form-item label="反馈类型" prop="category_id">
                <el-select v-model="form.category_id" placeholder="请选择反馈类型" style="width: 100%">
                  <el-option
                    v-for="cat in categories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入反馈标题" maxlength="100" show-word-limit />
              </el-form-item>

              <el-form-item label="内容" prop="content">
                <el-input
                  v-model="form.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细描述您遇到的问题或建议"
                  maxlength="2000"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="附件">
                <el-upload
                  action="/api/upload"
                  :headers="uploadHeaders"
                  :on-success="handleUploadSuccess"
                  :on-remove="handleUploadRemove"
                  :file-list="fileList"
                  multiple
                >
                  <el-button type="primary" class="upload-btn">
                    <el-icon><Upload /></el-icon>
                    上传附件
                  </el-button>
                </el-upload>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSubmit" :loading="submitting" class="submit-btn">提交反馈</el-button>
                <el-button @click="$router.push('/')" class="cancel-btn">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="records-card" shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon :size="18" color="var(--color-primary)"><List /></el-icon>
                <span class="section-title">我的反馈记录</span>
              </div>
            </template>
            <el-table :data="records" v-loading="recordsLoading" class="custom-table">
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="category_name" label="类型" width="90" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'pending'" type="warning" size="small" class="status-tag">待处理</el-tag>
                  <el-tag v-else-if="row.status === 'processing'" type="primary" size="small" class="status-tag">处理中</el-tag>
                  <el-tag v-else type="success" size="small" class="status-tag">已处理</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="提交时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="viewDetail(row.id)">
                    <el-icon><View /></el-icon>查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-if="recordsTotal > 0"
              v-model:current-page="recordsPage"
              v-model:page-size="recordsPageSize"
              :total="recordsTotal"
              layout="prev, pager, next"
              @change="loadRecords"
              class="pagination"
            />
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <el-dialog v-model="detailVisible" title="反馈详情" width="600px" class="detail-dialog">
      <div v-if="detail" class="detail-content">
        <h4 class="detail-title">{{ detail.feedback?.title }}</h4>
        <p class="detail-meta">
          类型：{{ detail.feedback?.category_name }} | 时间：{{ formatDate(detail.feedback?.created_at) }}
        </p>
        <el-divider />
        <p class="detail-body">{{ detail.feedback?.content }}</p>
        <div v-if="detail.attachments && detail.attachments.length > 0" class="detail-section">
          <el-divider />
          <h4 class="detail-section-title">附件</h4>
          <div v-for="att in detail.attachments" :key="att.id" class="attachment-item">
            <el-link type="primary" :href="att.file_url" target="_blank">{{ att.file_name }}</el-link>
          </div>
        </div>
        <div v-if="detail.replies && detail.replies.length > 0" class="detail-section">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const categories = ref<any[]>([]);
const formRef = ref<any>(null);
const form = ref({
  category_id: undefined as number | undefined,
  title: '',
  content: '',
  attachments: [] as any[],
});
const rules = {
  category_id: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};
const submitting = ref(false);
const fileList = ref<any[]>([]);
const uploadHeaders = ref({ Authorization: `Bearer ${authStore.token}` });

const records = ref<any[]>([]);
const recordsLoading = ref(false);
const recordsPage = ref(1);
const recordsPageSize = ref(10);
const recordsTotal = ref(0);

const detailVisible = ref(false);
const detail = ref<any>(null);

onMounted(() => {
  loadCategories();
  loadRecords();
});

async function loadCategories() {
  try {
    const res: any = await request.post('/feedbackCategoryService.list', {});
    if (res.code === 200) {
      categories.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadRecords() {
  recordsLoading.value = true;
  try {
    const res: any = await request.post('/feedbackService.list', {
      page: recordsPage.value,
      pageSize: recordsPageSize.value,
    });
    if (res.code === 200) {
      records.value = res.data.list;
      recordsTotal.value = res.data.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    recordsLoading.value = false;
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

function handleUploadSuccess(response: any, file: any) {
  if (response.code === 200) {
    form.value.attachments.push({
      name: file.name,
      url: response.data.url,
    });
  }
}

function handleUploadRemove(file: any) {
  form.value.attachments = form.value.attachments.filter(a => a.name !== file.name);
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const res: any = await request.post('/feedbackService.create', {
      category_id: form.value.category_id,
      title: form.value.title,
      content: form.value.content,
      attachments: form.value.attachments,
    });
    if (res.code === 200) {
      ElMessage.success('反馈提交成功');
      form.value = { category_id: undefined, title: '', content: '', attachments: [] };
      fileList.value = [];
      loadRecords();
    } else {
      ElMessage.error(res.message || '提交失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('提交失败');
  } finally {
    submitting.value = false;
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

function formatDate(d: string) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString();
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-background), var(--color-background-light));
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  height: 64px;
  padding: 0 28px;
  box-shadow: var(--shadow-header);
  position: sticky;
  top: 0;
  z-index: 5;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-text {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-btn {
  font-size: 14px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  cursor: pointer;
}
.nav-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-hover-bg);
}
.nav-btn.active {
  color: var(--color-primary);
  font-weight: 600;
}
.logout-btn:hover {
  color: var(--color-danger);
  background: var(--color-danger-light);
}
.main-content {
  padding: 28px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.page-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 6px 0 0;
}
.form-card,
.records-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.records-card :deep(.el-card__body) {
  overflow-x: auto;
}
.form-card :deep(.el-card__header),
.records-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-divider);
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
.upload-btn {
  border-radius: var(--radius-sm);
}
.submit-btn {
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  border: none;
}
.submit-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
}
.cancel-btn {
  border-radius: var(--radius-sm);
}
.status-tag {
  border-radius: 6px;
}
.pagination {
  margin-top: 16px;
  justify-content: center;
}

.detail-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-divider);
  margin-right: 0;
}
.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.detail-content {
  color: var(--color-text);
}
.detail-title {
  font-family: var(--font-heading);
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
  white-space: pre-wrap;
}
.detail-section {
  margin-top: 8px;
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
  color: var(--color-text);
  line-height: 1.6;
}
</style>
