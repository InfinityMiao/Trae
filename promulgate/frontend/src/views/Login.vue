<template>
  <div class="login-container">
    <div class="login-bg-pattern" />
    <el-card class="login-card">
      <div class="login-header">
        <div class="login-icon-wrapper">
          <el-icon :size="32" color="var(--color-surface)"><School /></el-icon>
        </div>
        <h2 class="login-title">制度学习与问题反馈平台</h2>
        <p class="login-subtitle">企业制度学习 · 在线考试 · 问题反馈</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" class="login-form" @keyup.enter="handleLogin">
        <el-form-item prop="employee_no">
          <el-input v-model="form.employee_no" placeholder="工资编号" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-btn" size="large">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button text @click="showReset = true" class="forgot-btn" size="large">忘记密码？</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="showReset" title="密码找回" width="420px" class="custom-dialog">
      <el-form :model="resetForm" :rules="resetRules" ref="resetRef" label-width="100px">
        <el-form-item label="工资编号" prop="employee_no">
          <el-input v-model="resetForm.employee_no" />
        </el-form-item>
        <el-form-item label="身份证后6位" prop="id_card_last6">
          <el-input v-model="resetForm.id_card_last6" maxlength="6" />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="resetForm.new_password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReset = false">取消</el-button>
        <el-button type="primary" @click="handleReset" :loading="resetLoading">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showChange" title="首次登录，请修改密码" width="420px" :close-on-click-modal="false" :show-close="false" class="custom-dialog">
      <el-form :model="changeForm" :rules="changeRules" ref="changeRef" label-width="100px">
        <el-form-item label="旧密码" prop="old_password">
          <el-input v-model="changeForm.old_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="changeForm.new_password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleChange" :loading="changeLoading">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref();
const resetRef = ref();
const changeRef = ref();
const loading = ref(false);
const resetLoading = ref(false);
const changeLoading = ref(false);
const showReset = ref(false);
const showChange = ref(false);
const tempToken = ref('');

const form = reactive({ employee_no: '', password: '' });
const rules = {
  employee_no: [{ required: true, message: '请输入工资编号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const resetForm = reactive({ employee_no: '', id_card_last6: '', new_password: '' });
const resetRules = {
  employee_no: [{ required: true, message: '请输入工资编号', trigger: 'blur' }],
  id_card_last6: [{ required: true, len: 6, message: '请输入6位身份证后六位', trigger: 'blur' }],
  new_password: [{ required: true, min: 8, message: '密码至少8位', trigger: 'blur' }],
};

const changeForm = reactive({ old_password: '', new_password: '' });
const changeRules = {
  old_password: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_: any, value: string, callback: Function) => {
        if (!value || value.length < 8) {
          callback(new Error('密码至少8位'));
          return;
        }
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
          callback(new Error('必须包含大写、小写字母和数字'));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
};

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const res: any = await request.post('/authService.login', form);
    if (res.code === 200) {
      if (res.data.first_login) {
        tempToken.value = res.data.token;
        showChange.value = true;
      } else {
        authStore.setToken(res.data.token, res.data.employee_type);
        ElMessage.success('登录成功');
        router.push(res.data.employee_type === 'admin' ? '/admin' : '/');
      }
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '登录失败');
  }
  loading.value = false;
}

async function handleReset() {
  const valid = await resetRef.value?.validate().catch(() => false);
  if (!valid) return;
  resetLoading.value = true;
  try {
    const res: any = await request.post('/authService.resetPassword', resetForm);
    if (res.code === 200) {
      ElMessage.success('密码重置成功，请登录');
      showReset.value = false;
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '重置失败');
  }
  resetLoading.value = false;
}

async function handleChange() {
  const valid = await changeRef.value?.validate().catch(() => false);
  if (!valid) return;
  changeLoading.value = true;
  try {
    const res: any = await request.post('/authService.changePassword', {
      old_password: changeForm.old_password,
      new_password: changeForm.new_password,
    }, {
      headers: { Authorization: `Bearer ${tempToken.value}` },
    });
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录');
      showChange.value = false;
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '修改失败');
  }
  changeLoading.value = false;
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-background), var(--color-background-light));
  position: relative;
  overflow: hidden;
}
.login-bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 80%, var(--color-primary-bg) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, var(--color-primary-hover-bg) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, var(--overlay-white) 0%, transparent 70%);
  pointer-events: none;
}
.login-card {
  width: 440px;
  border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-login);
  position: relative;
  z-index: 1;
}
.login-card :deep(.el-card__body) {
  padding: 40px;
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 16px var(--color-primary-shadow);
}
.login-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}
.login-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}
.login-form :deep(.el-input__wrapper) {
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 1px var(--color-border) inset;
  transition: all 0.2s ease;
}
.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-secondary) inset;
}
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-primary) inset, 0 0 0 3px var(--color-primary-border);
}
.login-btn {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 15px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none;
  transition: all 0.25s ease;
}
.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--color-primary-shadow);
}
.forgot-btn {
  width: 100%;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}
.forgot-btn:hover {
  color: var(--color-primary);
}

@media (max-width: 767px) {
  .login-card {
    width: 90vw;
    max-width: 400px;
  }
  .login-card :deep(.el-card__body) {
    padding: 28px 20px;
  }
  .login-title {
    font-size: 19px;
  }
  .login-subtitle {
    font-size: 13px;
  }
  .login-icon-wrapper {
    width: 52px;
    height: 52px;
    border-radius: 14px;
  }
  .login-header {
    margin-bottom: 24px;
  }
  .login-btn {
    height: 44px;
    font-size: 14px;
  }
  :deep(.el-dialog) {
    width: 92vw !important;
    margin: 16px auto;
  }
}
</style>
