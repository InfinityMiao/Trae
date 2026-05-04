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
      <el-card class="result-card" shadow="never">
        <div class="result-icon-wrapper" :class="isPassed ? 'pass' : 'fail'">
          <el-icon v-if="isPassed" :size="56" color="var(--color-surface)"><CircleCheck /></el-icon>
          <el-icon v-else :size="56" color="var(--color-surface)"><CircleClose /></el-icon>
        </div>
        <h2 class="result-title">{{ isPassed ? '恭喜通过考试！' : '很遗憾，未通过考试' }}</h2>
        <p class="result-subtitle">{{ isPassed ? '您的成绩已达到及格标准' : '请继续努力，争取下次通过' }}</p>
        <div class="score-display">
          <span class="score-label">得分</span>
          <span class="score-value" :class="isPassed ? 'pass' : 'fail'">{{ score }}</span>
          <span class="score-unit">分</span>
        </div>
        <div class="actions">
          <el-button type="primary" @click="$router.push('/exams')" class="action-btn">
            <el-icon><ArrowLeft /></el-icon>返回考试列表
          </el-button>
          <el-button v-if="!isPassed" @click="retakeExam" class="action-btn retake-btn">
            <el-icon><RefreshRight /></el-icon>重新考试
          </el-button>
        </div>
      </el-card>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const score = computed(() => Number(route.query.score) || 0);
const isPassed = computed(() => route.query.is_passed === '1');
const examId = computed(() => Number(route.params.id));

function retakeExam() {
  router.push(`/exams/${examId.value}`);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
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
  max-width: 560px;
  margin: 0 auto;
}
.result-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}
.result-card :deep(.el-card__body) {
  padding: 48px 40px;
}
.result-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}
.result-icon-wrapper.pass {
  background: linear-gradient(135deg, var(--color-cta), var(--color-secondary));
  box-shadow: 0 8px 24px var(--color-primary-shadow);
}
.result-icon-wrapper.fail {
  background: linear-gradient(135deg, var(--color-danger), var(--color-danger-light));
  box-shadow: 0 8px 24px var(--color-danger-shadow);
}
.result-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}
.result-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 32px;
}
.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
}
.score-label {
  font-size: 16px;
  color: var(--color-text-muted);
}
.score-value {
  font-family: var(--font-heading);
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
}
.score-value.pass {
  color: var(--color-success);
}
.score-value.fail {
  color: var(--color-danger);
}
.score-unit {
  font-size: 18px;
  color: var(--color-text-muted);
}
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.action-btn {
  border-radius: var(--radius-sm);
  min-width: 140px;
  font-weight: 500;
}
.retake-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.retake-btn:hover {
  background: var(--color-primary-hover-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
