<template>
  <div class="home-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo-icon-wrapper">
          <el-icon :size="24" color="var(--color-text-light)"><School /></el-icon>
        </div>
        <span class="logo-text">制度学习平台</span>
      </div>
      <div class="nav">
        <el-button text class="nav-btn active" @click="$router.push('/')">
          <el-icon><HomeFilled /></el-icon>首页
        </el-button>
        <el-button text class="nav-btn" @click="$router.push('/regulations')">
          <el-icon><Document /></el-icon>制度学习
        </el-button>
        <el-button text class="nav-btn" @click="$router.push('/exams')">
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
        <h1 class="page-title">欢迎回来</h1>
        <p class="page-desc">快速访问常用功能，了解最新公告</p>
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-card class="quick-card" shadow="never" @click="$router.push('/regulations')">
            <div class="quick-icon-wrapper" style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));">
              <el-icon :size="28" color="var(--color-surface)"><Document /></el-icon>
            </div>
            <div class="quick-body">
              <div class="quick-title">制度学习</div>
              <div class="quick-desc">浏览学习企业制度</div>
            </div>
            <el-icon class="quick-arrow" color="var(--color-text-light)"><ArrowRight /></el-icon>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="quick-card" shadow="never" @click="$router.push('/exams')">
            <div class="quick-icon-wrapper" style="background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-light));">
              <el-icon :size="28" color="var(--color-surface)"><EditPen /></el-icon>
            </div>
            <div class="quick-body">
              <div class="quick-title">在线考试</div>
              <div class="quick-desc">参加制度知识考试</div>
            </div>
            <el-icon class="quick-arrow" color="var(--color-text-light)"><ArrowRight /></el-icon>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="quick-card" shadow="never" @click="$router.push('/feedback/submit')">
            <div class="quick-icon-wrapper" style="background: linear-gradient(135deg, var(--color-warning), var(--color-warning-light));">
              <el-icon :size="28" color="var(--color-surface)"><ChatDotRound /></el-icon>
            </div>
            <div class="quick-body">
              <div class="quick-title">问题反馈</div>
              <div class="quick-desc">提交问题或建议</div>
            </div>
            <el-icon class="quick-arrow" color="var(--color-text-light)"><ArrowRight /></el-icon>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 24px">
        <el-col :span="24">
          <el-card class="announcement-card" shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon :size="20" color="var(--color-primary)"><Bell /></el-icon>
                <span class="section-title">公告栏</span>
              </div>
            </template>
            <el-empty v-if="announcements.length === 0" description="暂无公告" />
            <div v-else class="announcement-list">
              <div v-for="item in announcements" :key="item.id" class="announcement-item">
                <div class="announcement-dot" />
                <div class="announcement-content">{{ item.content }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
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
const announcements = ref<any[]>([]);

onMounted(async () => {
  try {
    const res: any = await request.post('/announcementService.list', {});
    if (res.code === 200) {
      announcements.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.home-container {
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
.quick-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.25s ease;
}
.quick-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}
.quick-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}
.quick-card:hover .quick-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}
.quick-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.quick-body {
  flex: 1;
}
.quick-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}
.quick-desc {
  font-size: 13px;
  color: var(--color-text-muted);
}
.quick-arrow {
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.announcement-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.announcement-card :deep(.el-card__header) {
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
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.announcement-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-divider);
  transition: background 0.2s ease;
}
.announcement-item:hover {
  background: var(--color-primary-hover-bg);
}
.announcement-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
  margin-top: 6px;
}
.announcement-content {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.6;
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
  .quick-card :deep(.el-card__body) {
    padding: 16px;
    gap: 12px;
  }
  .quick-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  .quick-title {
    font-size: 15px;
  }
  .announcement-item {
    padding: 10px 12px;
  }
}
</style>
