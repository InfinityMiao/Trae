import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface UserInfo {
  id: number;
  name: string;
  employee_no: string;
  employee_type: 'admin' | 'employee';
  department_id?: number;
  department_name?: string;
  position_id?: number;
  position_name?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const employeeType = ref<'admin' | 'employee' | ''>(localStorage.getItem('employee_type') as any || '');
  const userInfo = ref<UserInfo | null>(null);

  const isAdmin = computed(() => employeeType.value === 'admin');
  const isEmployee = computed(() => employeeType.value === 'employee');
  const isLoggedIn = computed(() => !!token.value);

  function setToken(newToken: string, type: 'admin' | 'employee') {
    token.value = newToken;
    employeeType.value = type;
    localStorage.setItem('token', newToken);
    localStorage.setItem('employee_type', type);
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function logout() {
    token.value = '';
    employeeType.value = '';
    userInfo.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('employee_type');
  }

  return {
    token,
    employeeType,
    userInfo,
    isAdmin,
    isEmployee,
    isLoggedIn,
    setToken,
    setUserInfo,
    logout,
  };
});
