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
        <el-button text class="nav-btn active" @click="$router.push('/regulations')">
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
        <el-button text class="back-btn" @click="$router.push('/regulations')">
          <el-icon><ArrowLeft /></el-icon>返回制度列表
        </el-button>
      </div>

      <el-card v-loading="loading" class="detail-card" shadow="never">
        <template v-if="regulation">
          <div class="detail-header">
            <h1 class="detail-title">{{ regulation.title }}</h1>
            <div class="detail-meta">
              <el-tag size="small" class="category-tag">{{ regulation.category_name || '未分类' }}</el-tag>
              <span class="meta-item">
                <el-icon :size="14"><Clock /></el-icon>
                发布时间：{{ formatDate(regulation.created_at) }}
              </span>
            </div>
          </div>

          <el-divider />

          <div class="pdf-section" v-if="regulation.pdf_url">
            <div class="section-header">
              <el-icon :size="18" color="var(--color-primary)"><Document /></el-icon>
              <span class="section-title">制度文件</span>
            </div>
            <div
              ref="pdfContainerRef"
              class="pdf-container"
              @contextmenu.prevent
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
            >
              <div v-for="pageNum in pageCount" :key="pageNum" class="pdf-page-wrapper">
                <canvas
                  :ref="(el) => setCanvasRef(el as HTMLCanvasElement, pageNum)"
                  class="pdf-page-canvas"
                />
                <div class="pdf-page-overlay" />
              </div>
            </div>
          </div>

          <div class="content-section">
            <div class="section-header">
              <el-icon :size="18" color="var(--color-primary)"><Notebook /></el-icon>
              <span class="section-title">内容摘要</span>
            </div>
            <div class="content" v-html="regulation.content"></div>
          </div>

          <div class="exams-section" v-if="exams.length > 0">
            <el-divider />
            <div class="section-header" style="margin-bottom: 16px">
              <el-icon :size="18" color="var(--color-primary)"><EditPen /></el-icon>
              <span class="section-title">关联考试</span>
            </div>
            <el-row :gutter="16">
              <el-col v-for="exam in exams" :key="exam.id" :xs="24" :sm="12">
                <el-card shadow="never" class="exam-card">
                  <div class="exam-info">
                    <span class="exam-name">{{ exam.name }}</span>
                    <el-tag v-if="exam.is_passed" type="success" size="small" class="exam-tag">已通过</el-tag>
                    <el-tag v-else-if="exam.best_score > 0" type="danger" size="small" class="exam-tag">未通过</el-tag>
                    <el-tag v-else type="info" size="small" class="exam-tag">未参加</el-tag>
                  </div>
                  <el-button size="small" type="primary" @click="$router.push(`/exams/${exam.id}`)" class="exam-btn">
                    {{ exam.best_score > 0 ? '重新考试' : '开始考试' }}
                  </el-button>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-empty v-else description="制度不存在" />
      </el-card>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';

let pdfjsLib: any = null;

async function getPdfjsLib() {
  if (pdfjsLib) return pdfjsLib;
  // @ts-ignore
  pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.mjs';
  return pdfjsLib;
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const regulationId = Number(route.params.id);
const loading = ref(true);
const regulation = ref<any>(null);
const exams = ref<any[]>([]);

const pageCount = ref(0);
const scale = ref(1.2);
const pdfContainerRef = ref<HTMLDivElement | null>(null);
const canvasMap = ref(new Map<number, HTMLCanvasElement>());
let renderTimer: ReturnType<typeof setTimeout> | null = null;

function setCanvasRef(el: HTMLCanvasElement | null, pageNum: number) {
  if (el) canvasMap.value.set(pageNum, el);
}

function getWatermarkText() {
  const name = authStore.userInfo?.name || '未知用户';
  const time = new Date().toLocaleString('zh-CN');
  return `${name} ${time}`;
}

function drawWatermark(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const fontSize = 14;
  ctx.save();
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = 'var(--watermark-color)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const stepX = 180;
  const stepY = 120;
  const angle = -Math.PI / 6;

  for (let y = -stepY; y < canvas.height + stepY * 2; y += stepY) {
    for (let x = -stepX; x < canvas.width + stepX * 2; x += stepX) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

async function renderPdf(url: string) {
  try {
    const pdfjs = await getPdfjsLib();
    const pdf = await pdfjs.getDocument({ url }).promise;
    pageCount.value = pdf.numPages;
    await nextTick();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale.value });
      const canvas = canvasMap.value.get(i);
      if (!canvas) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport }).promise;
      drawWatermark(canvas, getWatermarkText());
    }
  } catch (e) {
    console.error('PDF render error:', e);
  }
}

function debouncedRenderPdf(url: string) {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderPdf(url);
  }, 150);
}

onMounted(() => {
  loadDetail();
  bindDisableEvents();
});

onUnmounted(() => {
  unbindDisableEvents();
  if (renderTimer) clearTimeout(renderTimer);
});

async function loadDetail() {
  loading.value = true;
  try {
    const res: any = await request.post('/regulationService.get', { id: regulationId });
    if (res.code === 200) {
      regulation.value = res.data;
      if (res.data.pdf_url) {
        await renderPdf(res.data.pdf_url);
      }
    }
  } catch (e) {
    console.error(e);
  }

  try {
    const examRes: any = await request.post('/examService.getByRegulation', { regulation_id: regulationId });
    if (examRes.code === 200) {
      exams.value = examRes.data;
    }
  } catch (e) {
    console.error(e);
  }

  loading.value = false;
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

function onKeyDown(e: KeyboardEvent) {
  if (
    (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
    e.key === 'F12'
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
}

function onSelectStart(e: Event) {
  e.preventDefault();
}

function bindDisableEvents() {
  document.addEventListener('keydown', onKeyDown);
  pdfContainerRef.value?.addEventListener('contextmenu', onContextMenu);
  pdfContainerRef.value?.addEventListener('selectstart', onSelectStart);
}

function unbindDisableEvents() {
  document.removeEventListener('keydown', onKeyDown);
  pdfContainerRef.value?.removeEventListener('contextmenu', onContextMenu);
  pdfContainerRef.value?.removeEventListener('selectstart', onSelectStart);
}

let initialPinchDistance = 0;
let initialScale = 1;

function getPinchDistance(touches: TouchList) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    initialPinchDistance = getPinchDistance(e.touches);
    initialScale = scale.value;
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const distance = getPinchDistance(e.touches);
    const ratio = distance / initialPinchDistance;
    const newScale = Math.min(Math.max(initialScale * ratio, 0.5), 3);
    if (Math.abs(newScale - scale.value) > 0.05) {
      scale.value = newScale;
      if (regulation.value?.pdf_url) {
        debouncedRenderPdf(regulation.value.pdf_url);
      }
    }
  }
}

function onTouchEnd() {
  if (regulation.value?.pdf_url) {
    renderPdf(regulation.value.pdf_url);
  }
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
  max-width: 1000px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 16px;
}
.back-btn {
  color: var(--color-text-muted);
  font-size: 14px;
  transition: color 0.2s ease;
  cursor: pointer;
}
.back-btn:hover {
  color: var(--color-primary);
}
.detail-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.detail-card :deep(.el-card__body) {
  padding: 32px;
}
.detail-header {
  margin-bottom: 8px;
}
.detail-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
  line-height: 1.4;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--color-text-muted);
  font-size: 13px;
}
.category-tag {
  border-radius: 6px;
  background: var(--color-primary-active-bg);
  color: var(--color-primary);
  border: none;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.content {
  line-height: 1.8;
  color: var(--color-text);
  font-size: 15px;
}
.content :deep(p) {
  margin: 8px 0;
}
.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
  margin: 20px 0 10px;
  color: var(--color-text);
}
.pdf-container {
  overflow: auto;
  width: 100%;
  max-height: 800px;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
  user-select: none;
  -webkit-user-select: none;
}
.pdf-page-wrapper {
  position: relative;
  margin: 0 auto 12px;
  width: fit-content;
}
.pdf-page-canvas {
  display: block;
  border-radius: 4px;
  box-shadow: var(--shadow-pdf);
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}
.pdf-page-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: transparent;
}
.exam-card {
  margin-bottom: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  transition: all 0.2s ease;
  cursor: pointer;
}
.exam-card:hover {
  border-color: var(--color-secondary);
  box-shadow: 0 2px 8px var(--color-primary-hover-bg);
}
.exam-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.exam-name {
  font-weight: 500;
  color: var(--color-text);
}
.exam-tag {
  border-radius: 6px;
}
.exam-btn {
  border-radius: var(--radius-sm);
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
  .nav-btn {
    font-size: 0;
    padding: 6px 8px;
  }
  .nav-btn .el-icon {
    font-size: 18px;
    margin-right: 0;
  }
  .detail-card :deep(.el-card__body) {
    padding: 20px;
  }
  .detail-title {
    font-size: 20px;
  }
  .detail-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
  .pdf-container {
    max-height: 500px;
  }
  .exam-info {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
