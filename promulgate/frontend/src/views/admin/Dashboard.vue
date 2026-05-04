<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">数据看板</h1>
      <p class="page-desc">实时了解平台运营数据</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon-wrapper" style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));">
            <el-icon :size="24" color="var(--color-surface)"><User /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">员工总数</div>
            <div class="stat-value">{{ stats.total_employees }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon-wrapper" style="background: linear-gradient(135deg, var(--color-blue), var(--color-blue-light));">
            <el-icon :size="24" color="var(--color-surface)"><Document /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">制度总数</div>
            <div class="stat-value">{{ stats.total_regulations }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon-wrapper" style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-lighter));">
            <el-icon :size="24" color="var(--color-surface)"><EditPen /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">考试总数</div>
            <div class="stat-value">{{ stats.total_exams }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon-wrapper" style="background: linear-gradient(135deg, var(--color-danger), var(--color-danger-light));">
            <el-icon :size="24" color="var(--color-surface)"><ChatDotRound /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">待处理反馈</div>
            <div class="stat-value" style="color: var(--color-danger)">{{ stats.pending_feedbacks }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="24">
        <el-card class="quick-actions-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon :size="20" color="var(--color-primary)"><MagicStick /></el-icon>
              <span class="section-title">快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="$router.push('/admin/regulations')">
              <div class="action-icon" style="background: var(--color-blue-bg);">
                <el-icon :size="22" color="var(--color-blue)"><DocumentAdd /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">新建制度</div>
                <div class="action-desc">发布新的学习制度</div>
              </div>
              <el-icon class="action-arrow" color="var(--color-text-muted)"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="$router.push('/admin/exams')">
              <div class="action-icon" style="background: var(--color-primary-bg);">
                <el-icon :size="22" color="var(--color-primary)"><CircleCheck /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">发布考试</div>
                <div class="action-desc">创建在线考试内容</div>
              </div>
              <el-icon class="action-arrow" color="var(--color-text-muted)"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="$router.push('/admin/feedbacks')">
              <div class="action-icon" style="background: var(--color-danger-bg);">
                <el-icon :size="22" color="var(--color-danger)"><ChatLineRound /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">处理反馈</div>
                <div class="action-desc">查看并回复员工反馈</div>
              </div>
              <el-icon class="action-arrow" color="var(--color-text-muted)"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="$router.push('/admin/employees')">
              <div class="action-icon" style="background: var(--color-blue-bg);">
                <el-icon :size="22" color="var(--color-blue)"><User /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">添加员工</div>
                <div class="action-desc">录入新员工信息</div>
              </div>
              <el-icon class="action-arrow" color="var(--color-text-muted)"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '@/utils/request';

const stats = ref({
  total_employees: 0,
  total_regulations: 0,
  total_exams: 0,
  pending_feedbacks: 0,
});

onMounted(async () => {
  try {
    const res: any = await request.post('/dashboardService.getStats', {});
    if (res.code === 200) {
      stats.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 6px 0 0;
}
.stat-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  transition: all 0.25s ease;
  cursor: pointer;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}
.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-body {
  flex: 1;
}
.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}
.quick-actions-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
}
.quick-actions-card :deep(.el-card__header) {
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
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-divider);
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border);
}
.action-item:hover .action-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}
.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-text {
  flex: 1;
}
.action-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}
.action-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.action-arrow {
  transition: all 0.2s ease;
}
</style>
