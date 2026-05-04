<template>
  <el-container class="admin-layout">
    <el-aside width="240px" class="aside">
      <div class="logo">
        <el-icon :size="28" class="logo-icon"><School /></el-icon>
        <div class="logo-text">
          <div class="logo-title">制度学习平台</div>
          <div class="logo-sub">管理后台</div>
        </div>
      </div>
      <div class="menu-wrapper">
        <el-menu :default-active="$route.path" router class="menu">
          <el-menu-item index="/admin">
            <el-icon><DataLine /></el-icon>
            <span>数据看板</span>
          </el-menu-item>
          <div class="menu-divider">组织管理</div>
          <el-menu-item index="/admin/departments">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/positions">
            <el-icon><UserFilled /></el-icon>
            <span>岗位管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/employees">
            <el-icon><User /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <div class="menu-divider">内容管理</div>
          <el-menu-item index="/admin/announcements">
            <el-icon><Bell /></el-icon>
            <span>公告管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/regulation-categories">
            <el-icon><Folder /></el-icon>
            <span>制度分类</span>
          </el-menu-item>
          <el-menu-item index="/admin/regulations">
            <el-icon><Document /></el-icon>
            <span>制度管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/exams">
            <el-icon><EditPen /></el-icon>
            <span>考试管理</span>
          </el-menu-item>
          <div class="menu-divider">互动管理</div>
          <el-menu-item index="/admin/feedbacks">
            <el-icon><ChatDotRound /></el-icon>
            <span>反馈管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/feedback-categories">
            <el-icon><Collection /></el-icon>
            <span>反馈分类</span>
          </el-menu-item>
          <el-menu-item index="/admin/faqs">
            <el-icon><QuestionFilled /></el-icon>
            <span>FAQ管理</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>
    <el-container class="main-container">
      <el-header class="header">
        <div class="breadcrumb">
          <el-icon :size="18" color="var(--color-primary)"><Monitor /></el-icon>
          <span class="breadcrumb-text">管理员控制台</span>
        </div>
        <div class="header-actions">
          <el-tooltip content="返回前台">
            <el-button text circle @click="router.push('/')">
              <el-icon><HomeFilled /></el-icon>
            </el-button>
          </el-tooltip>
          <el-divider direction="vertical" />
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" class="user-avatar"><el-icon><UserFilled /></el-icon></el-avatar>
              <span class="user-name">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logout();
    router.push('/login');
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--color-background);
}
.aside {
  background: linear-gradient(180deg, var(--color-sidebar-bg) 0%, var(--color-sidebar-bg) 100%);
  color: var(--color-surface);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px var(--shadow-sidebar);
  z-index: 10;
}
.logo {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid var(--color-sidebar-border);
}
.logo-icon {
  color: var(--color-primary-light);
  flex-shrink: 0;
}
.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-surface);
  letter-spacing: 0.5px;
}
.logo-sub {
  font-size: 11px;
  color: var(--color-sidebar-text);
  font-weight: 400;
  margin-top: 2px;
}
.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
.menu-wrapper::-webkit-scrollbar {
  width: 4px;
}
.menu-wrapper::-webkit-scrollbar-thumb {
  background: var(--color-sidebar-hover);
  border-radius: 2px;
}
.menu {
  border-right: none;
  background: transparent;
}
:deep(.el-menu-item) {
  color: var(--color-sidebar-text-light);
  height: 44px;
  line-height: 44px;
  margin: 4px 12px;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}
:deep(.el-menu-item .el-icon) {
  color: var(--color-sidebar-text);
  font-size: 18px;
  margin-right: 10px;
}
:deep(.el-menu-item.is-active) {
  color: var(--color-surface);
  background: var(--color-primary-border);
  font-weight: 600;
  box-shadow: 0 2px 8px var(--color-primary-shadow);
}
:deep(.el-menu-item.is-active .el-icon) {
  color: var(--color-surface);
}
:deep(.el-menu-item:hover) {
  background: var(--color-sidebar-active);
  color: var(--color-surface);
}
:deep(.el-menu-item:hover .el-icon) {
  color: var(--color-sidebar-text-light);
}
.menu-divider {
  padding: 16px 20px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.main-container {
  background: var(--color-background);
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
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
}
.breadcrumb-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-info:hover {
  background: var(--color-divider);
}
.user-avatar {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: var(--color-surface);
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}
.main-content {
  padding: 28px;
}
</style>
