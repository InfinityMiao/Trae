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
        <el-button text class="nav-btn" @click="$router.push('/feedback/submit')">
          <el-icon><ChatDotRound /></el-icon>反馈
        </el-button>
        <el-button text class="nav-btn active">
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
        <h1 class="page-title">个人中心</h1>
        <p class="page-desc">管理您的个人信息和通知</p>
      </div>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="16" :offset="4">
          <el-card class="profile-card" shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon :size="18" color="var(--color-primary)"><User /></el-icon>
                <span class="section-title">个人信息</span>
              </div>
            </template>
            <div class="profile-grid">
              <div class="profile-item">
                <div class="profile-icon-wrapper">
                  <el-icon :size="18" color="var(--color-primary)"><User /></el-icon>
                </div>
                <div class="profile-body">
                  <div class="profile-label">姓名</div>
                  <div class="profile-value">{{ profile.name || '-' }}</div>
                </div>
              </div>
              <div class="profile-item">
                <div class="profile-icon-wrapper">
                  <el-icon :size="18" color="var(--color-primary)"><Key /></el-icon>
                </div>
                <div class="profile-body">
                  <div class="profile-label">工资编号</div>
                  <div class="profile-value">{{ profile.employee_no || '-' }}</div>
                </div>
              </div>
              <div class="profile-item">
                <div class="profile-icon-wrapper">
                  <el-icon :size="18" color="var(--color-primary)"><OfficeBuilding /></el-icon>
                </div>
                <div class="profile-body">
                  <div class="profile-label">部门</div>
                  <div class="profile-value">{{ profile.department_name || '-' }}</div>
                </div>
              </div>
              <div class="profile-item">
                <div class="profile-icon-wrapper">
                  <el-icon :size="18" color="var(--color-primary)"><Briefcase /></el-icon>
                </div>
                <div class="profile-body">
                  <div class="profile-label">岗位</div>
                  <div class="profile-value">{{ profile.position_name || '-' }}</div>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="password-card" shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon :size="18" color="var(--color-primary)"><Lock /></el-icon>
                <span class="section-title">修改密码</span>
              </div>
            </template>
            <el-form :model="pwdForm" :rules="pwdRules" ref="pwdRef" label-width="100px">
              <el-form-item label="旧密码" prop="old_password">
                <el-input v-model="pwdForm.old_password" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="new_password">
                <el-input v-model="pwdForm.new_password" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirm_password">
                <el-input v-model="pwdForm.confirm_password" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword" :loading="pwdLoading" class="submit-btn">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card class="notif-card" shadow="never">
            <template #header>
              <div class="notif-header">
                <div class="section-header">
                  <el-icon :size="18" color="var(--color-primary)"><Bell /></el-icon>
                  <span class="section-title">我的通知</span>
                </div>
                <el-button text type="primary" @click="markAllRead" class="mark-all-btn">全部已读</el-button>
              </div>
            </template>
            <el-empty v-if="notifications.length === 0" description="暂无通知" />
            <div v-else class="notif-list">
              <div
                v-for="item in notifications"
                :key="item.id"
                class="notif-item"
                :class="{ unread: item.is_read === 0 }"
                @click="markRead(item.id)"
              >
                <div class="notif-dot" v-if="item.is_read === 0" />
                <div class="notif-body">
                  <div class="notif-title">{{ item.title }}</div>
                  <div class="notif-content">{{ item.content }}</div>
                  <div class="notif-time">{{ formatDate(item.created_at) }}</div>
                </div>
              </div>
            </div>
            <el-pagination
              v-if="notifTotal > 0"
              v-model:current-page="notifPage"
              v-model:page-size="notifPageSize"
              :total="notifTotal"
              layout="prev, pager, next"
              @change="loadNotifications"
              class="pagination"
            />
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
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const profile = ref<any>({});
const pwdRef = ref<any>(null);
const pwdForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
});
const pwdRules = {
  old_password: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  new_password: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirm_password: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== pwdForm.value.new_password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};
const pwdLoading = ref(false);

const notifications = ref<any[]>([]);
const notifPage = ref(1);
const notifPageSize = ref(10);
const notifTotal = ref(0);

onMounted(() => {
  loadProfile();
  loadNotifications();
});

async function loadProfile() {
  try {
    const res: any = await request.post('/employeeService.getProfile', {});
    if (res.code === 200) {
      profile.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
}

async function handleChangePassword() {
  const valid = await pwdRef.value?.validate().catch(() => false);
  if (!valid) return;

  pwdLoading.value = true;
  try {
    const res: any = await request.post('/authService.changePassword', {
      old_password: pwdForm.value.old_password,
      new_password: pwdForm.value.new_password,
    });
    if (res.code === 200) {
      ElMessage.success('密码修改成功');
      pwdForm.value = { old_password: '', new_password: '', confirm_password: '' };
    } else {
      ElMessage.error(res.message || '修改失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('修改失败');
  } finally {
    pwdLoading.value = false;
  }
}

async function loadNotifications() {
  try {
    const res: any = await request.post('/notificationService.list', {
      page: notifPage.value,
      pageSize: notifPageSize.value,
    });
    if (res.code === 200) {
      notifications.value = res.data.list;
      notifTotal.value = res.data.total;
    }
  } catch (e) {
    console.error(e);
  }
}

async function markRead(id: number) {
  try {
    await request.post('/notificationService.markRead', { id });
    loadNotifications();
  } catch (e) {
    console.error(e);
  }
}

async function markAllRead() {
  try {
    await request.post('/notificationService.markAllRead', {});
    ElMessage.success('已全部标记为已读');
    loadNotifications();
  } catch (e) {
    console.error(e);
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
.profile-card,
.password-card,
.notif-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-bottom: 20px;
}
.profile-card :deep(.el-card__header),
.password-card :deep(.el-card__header),
.notif-card :deep(.el-card__header) {
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
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.profile-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--color-divider);
  transition: background 0.2s ease;
}
.profile-item:hover {
  background: var(--color-primary-hover-bg);
}
.profile-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile-body {
  flex: 1;
  min-width: 0;
}
.profile-label {
  font-size: 12px;
  color: var(--color-text);
  margin-bottom: 4px;
}
.profile-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}
.submit-btn {
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  border: none;
}
.submit-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mark-all-btn {
  font-size: 13px;
  cursor: pointer;
}
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  cursor: pointer;
  transition: all 0.2s ease;
}
.notif-item:hover {
  background: var(--color-primary-hover-bg);
  border-color: var(--color-secondary);
}
.notif-item.unread {
  border-left: 3px solid var(--color-primary);
  background: var(--color-primary-hover-bg);
}
.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
  margin-top: 6px;
}
.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  font-size: 14px;
}
.notif-content {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-bottom: 6px;
  line-height: 1.5;
}
.notif-time {
  color: var(--color-text);
  font-size: 12px;
}
.pagination {
  margin-top: 16px;
  justify-content: center;
}
</style>
