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
        <el-button text class="nav-btn active">
          <el-icon><EditPen /></el-icon>考试
        </el-button>
        <el-button text class="nav-btn" @click="$router.push('/feedback/submit')">
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
        <h1 class="page-title">我的考试</h1>
        <p class="page-desc">参加制度知识考试，检验学习成果</p>
      </div>

      <el-empty v-if="exams.length === 0" description="暂无可参加的考试" />
      <el-row v-else :gutter="20">
        <el-col v-for="exam in exams" :key="exam.id" :xs="24" :sm="12" :md="8" style="margin-bottom: 20px">
          <el-card class="exam-card" shadow="never">
            <template #header>
              <div class="exam-header">
                <span class="exam-name">{{ exam.name }}</span>
                <el-tag v-if="exam.is_passed" type="success" size="small" class="status-tag">已通过</el-tag>
                <el-tag v-else-if="exam.best_score > 0" type="danger" size="small" class="status-tag">未通过</el-tag>
                <el-tag v-else type="info" size="small" class="status-tag">未参加</el-tag>
              </div>
            </template>
            <div class="exam-info">
              <div class="info-item">
                <el-icon :size="14" color="var(--color-primary)"><Trophy /></el-icon>
                <span>及格分数线：{{ exam.pass_score }}分</span>
              </div>
              <div class="info-item">
                <el-icon :size="14" color="var(--color-cta)"><TrendCharts /></el-icon>
                <span>最高成绩：{{ exam.best_score }}分</span>
              </div>
              <p v-if="exam.description" class="exam-desc">{{ exam.description }}</p>
            </div>
            <template #footer>
              <el-button type="primary" @click="startExam(exam.id)" class="start-btn">
                {{ exam.best_score > 0 ? '重新考试' : '开始考试' }}
              </el-button>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <div class="records-section" style="margin-top: 40px">
        <div class="section-header" style="margin-bottom: 16px">
          <el-icon :size="20" color="var(--color-primary)"><DataLine /></el-icon>
          <span class="section-title">考试记录</span>
        </div>
        <el-card class="records-card" shadow="never">
          <el-table :data="records" v-loading="recordsLoading" class="custom-table">
            <el-table-column prop="exam_name" label="考试名称" />
            <el-table-column prop="score" label="得分" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_passed ? 'success' : 'danger'" size="small" class="score-tag">{{ row.score }}分</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="is_passed" label="是否通过" width="100">
              <template #default="{ row }">
                <span :class="row.is_passed ? 'text-success' : 'text-danger'">{{ row.is_passed ? '通过' : '未通过' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="submitted_at" label="考试时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.submitted_at) }}
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
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';

const router = useRouter();
const authStore = useAuthStore();

const exams = ref<any[]>([]);
const records = ref<any[]>([]);
const recordsLoading = ref(false);
const recordsPage = ref(1);
const recordsPageSize = ref(10);
const recordsTotal = ref(0);

onMounted(() => {
  loadExams();
  loadRecords();
});

async function loadExams() {
  try {
    const res: any = await request.post('/examService.list', {});
    if (res.code === 200) {
      exams.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadRecords() {
  recordsLoading.value = true;
  try {
    const res: any = await request.post('/examService.records', {
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

function startExam(examId: number) {
  router.push(`/exams/${examId}`);
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
.exam-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all 0.25s ease;
}
.exam-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}
.exam-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-divider);
}
.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.exam-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 15px;
}
.status-tag {
  border-radius: 6px;
}
.exam-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-muted);
}
.exam-desc {
  color: var(--color-text-light);
  font-size: 13px;
  margin-top: 4px;
}
.start-btn {
  border-radius: var(--radius-sm);
  width: 100%;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}
.records-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.score-tag {
  border-radius: 6px;
}
.text-success {
  color: var(--color-success);
  font-weight: 500;
}
.text-danger {
  color: var(--color-danger);
  font-weight: 500;
}
.pagination {
  margin-top: 20px;
  justify-content: center;
}

@media (max-width: 767px) {
  .header {
    padding: 0 16px;
  }
  .logo-text {
    font-size: 16px;
  }
  .main-content {
    padding: 16px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-desc {
    font-size: 13px;
  }
  .nav-btn {
    font-size: 0;
    padding: 6px 8px;
  }
  .nav-btn .el-icon {
    font-size: 18px;
    margin-right: 0;
  }
  .records-card :deep(.el-card__body) {
    overflow-x: auto;
  }
  .records-section {
    margin-top: 28px;
  }
  .section-title {
    font-size: 18px;
  }
}
</style>
