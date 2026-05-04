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
        <el-button text class="nav-btn active">
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
        <h1 class="page-title">制度学习</h1>
        <p class="page-desc">浏览和学习企业制度文件</p>
      </div>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="6">
          <el-card class="category-card" shadow="never">
            <template #header>
              <div class="section-header">
                <el-icon :size="18" color="var(--color-primary)"><Folder /></el-icon>
                <span class="section-title">制度分类</span>
              </div>
            </template>
            <el-menu
              :default-active="String(selectedCategory)"
              @select="handleCategorySelect"
              class="category-menu"
            >
              <el-menu-item index="0">
                <el-icon><Grid /></el-icon>
                <span>全部制度</span>
              </el-menu-item>
              <template v-for="cat in categories" :key="cat.id">
                <el-sub-menu v-if="cat.children && cat.children.length > 0" :index="String(cat.id)">
                  <template #title>
                    <el-icon><Folder /></el-icon>
                    <span>{{ cat.name }}</span>
                  </template>
                  <el-menu-item v-for="child in cat.children" :key="child.id" :index="String(child.id)">
                    <el-icon><FolderOpened /></el-icon>
                    <span>{{ child.name }}</span>
                  </el-menu-item>
                </el-sub-menu>
                <el-menu-item v-else :index="String(cat.id)">
                  <el-icon><FolderOpened /></el-icon>
                  <span>{{ cat.name }}</span>
                </el-menu-item>
              </template>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="18">
          <el-card class="list-card" shadow="never">
            <template #header>
              <div class="list-header">
                <div class="section-header">
                  <el-icon :size="18" color="var(--color-primary)"><Document /></el-icon>
                  <span class="section-title">制度列表</span>
                </div>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索制度名称"
                  style="width: 220px"
                  clearable
                  @keyup.enter="loadRegulations"
                  class="search-input"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </template>

            <el-empty v-if="regulations.length === 0" description="暂无制度" />
            <div v-else class="regulation-list">
              <div
                v-for="item in regulations"
                :key="item.id"
                class="regulation-item"
                @click="viewRegulation(item.id)"
              >
                <div class="reg-icon-wrapper">
                  <el-icon :size="20" color="var(--color-primary)"><Document /></el-icon>
                </div>
                <div class="reg-body">
                  <div class="reg-title">{{ item.title }}</div>
                  <div class="reg-meta">
                    <el-tag size="small" class="category-tag">{{ item.category_name || '未分类' }}</el-tag>
                    <span class="reg-time">{{ formatDate(item.created_at) }}</span>
                  </div>
                </div>
                <el-icon class="reg-arrow" color="var(--color-text-light)"><ArrowRight /></el-icon>
              </div>
            </div>

            <el-pagination
              v-if="total > 0"
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @change="loadRegulations"
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

const router = useRouter();
const authStore = useAuthStore();

const categories = ref<any[]>([]);
const selectedCategory = ref(0);
const regulations = ref<any[]>([]);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

onMounted(() => {
  loadCategories();
  loadRegulations();
});

async function loadCategories() {
  try {
    const res: any = await request.post('/regulationCategoryService.tree', {});
    if (res.code === 200) {
      categories.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadRegulations() {
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
    };
    if (selectedCategory.value > 0) {
      params.category_id = selectedCategory.value;
    }
    const res: any = await request.post('/regulationService.list', params);
    if (res.code === 200) {
      regulations.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (e) {
    console.error(e);
  }
}

function handleCategorySelect(index: string) {
  selectedCategory.value = Number(index);
  page.value = 1;
  loadRegulations();
}

function viewRegulation(id: number) {
  router.push(`/regulations/${id}`);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

function formatDate(d: string) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString();
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
.category-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.category-card :deep(.el-card__header) {
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
.category-menu {
  border-right: none;
}
.category-menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  border-radius: var(--radius-sm);
  margin: 2px 0;
  transition: all 0.2s ease;
  color: var(--color-text-muted);
}
.category-menu :deep(.el-menu-item.is-active) {
  color: var(--color-primary);
  background: var(--color-primary-active-bg);
  font-weight: 600;
}
.category-menu :deep(.el-menu-item:hover) {
  color: var(--color-primary);
  background: var(--color-primary-hover-bg);
}
.category-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  border-radius: var(--radius-sm);
  margin: 2px 0;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}
.category-menu :deep(.el-sub-menu__title:hover) {
  color: var(--color-primary);
  background: var(--color-primary-hover-bg);
}
.category-menu :deep(.el-sub-menu .el-menu) {
  background: transparent;
}
.category-menu :deep(.el-sub-menu .el-menu-item) {
  height: 36px;
  line-height: 36px;
  padding-left: 44px !important;
}
.list-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.list-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-divider);
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-sm);
}
.regulation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.regulation-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  cursor: pointer;
  transition: all 0.2s ease;
}
.regulation-item:hover {
  border-color: var(--color-secondary);
  background: var(--color-primary-hover-bg);
  box-shadow: 0 2px 8px var(--color-primary-hover-bg);
}
.regulation-item:hover .reg-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}
.reg-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.reg-body {
  flex: 1;
  min-width: 0;
}
.reg-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.reg-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.category-tag {
  border-radius: 6px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border: none;
}
.reg-time {
  color: var(--color-text-light);
  font-size: 13px;
}
.reg-arrow {
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
