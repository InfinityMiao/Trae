import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/regulations',
      name: 'Regulations',
      component: () => import('@/views/regulation/RegulationList.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/regulations/:id',
      name: 'RegulationDetail',
      component: () => import('@/views/regulation/RegulationDetail.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/exams',
      name: 'Exams',
      component: () => import('@/views/exam/ExamList.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/exams/:id',
      name: 'ExamTake',
      component: () => import('@/views/exam/ExamTake.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/exams/:id/result',
      name: 'ExamResult',
      component: () => import('@/views/exam/ExamResult.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/feedback/submit',
      name: 'FeedbackSubmit',
      component: () => import('@/views/feedback/FeedbackSubmit.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/profile/Profile.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/Layout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', component: () => import('@/views/admin/Dashboard.vue') },
        { path: 'departments', component: () => import('@/views/admin/department/DepartmentList.vue') },
        { path: 'positions', component: () => import('@/views/admin/position/PositionList.vue') },
        { path: 'employees', component: () => import('@/views/admin/employee/EmployeeList.vue') },
        { path: 'employees/import', component: () => import('@/views/admin/employee/EmployeeImport.vue') },
        { path: 'announcements', component: () => import('@/views/admin/announcement/AnnouncementList.vue') },
        { path: 'regulation-categories', component: () => import('@/views/admin/regulation/CategoryList.vue') },
        { path: 'regulations', component: () => import('@/views/admin/regulation/RegulationList.vue') },
        { path: 'exams', component: () => import('@/views/admin/exam/ExamList.vue') },
        { path: 'feedbacks', component: () => import('@/views/admin/feedback/FeedbackList.vue') },
        { path: 'feedback-categories', component: () => import('@/views/admin/feedback/CategoryList.vue') },
        { path: 'faqs', component: () => import('@/views/admin/faq/FaqList.vue') },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.public) {
    next();
    return;
  }

  if (!authStore.token) {
    next('/login');
    return;
  }

  if (to.meta.role === 'admin' && !authStore.isAdmin) {
    next('/');
    return;
  }

  if (to.meta.role === 'employee' && authStore.isAdmin) {
    next('/admin');
    return;
  }

  next();
});

export default router;
