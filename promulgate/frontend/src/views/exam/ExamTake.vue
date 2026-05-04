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
      <div v-if="loading" v-loading="true" style="height: 300px" />

      <template v-else-if="questions.length > 0">
        <el-card class="exam-card" shadow="never">
          <template #header>
            <div class="exam-title">
              <span class="exam-name">{{ examName }}</span>
              <div class="header-tags">
                <el-tag class="type-tag" :class="typeClass">
                  <el-icon v-if="currentQuestion.type === 'single'"><CircleCheck /></el-icon>
                  <el-icon v-else-if="currentQuestion.type === 'multiple'"><Checked /></el-icon>
                  <el-icon v-else><QuestionFilled /></el-icon>
                  {{ typeLabel }}
                </el-tag>
                <el-tag class="progress-tag">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</el-tag>
              </div>
            </div>
          </template>

          <div class="question-content">
            <h3 class="question-text">{{ currentQuestion.content }}</h3>

            <div v-if="currentQuestion.type === 'single'" class="options-row">
              <el-radio-group v-model="answers[currentIndex]" class="option-group">
                <div v-for="(opt, idx) in currentQuestion.options" :key="idx" class="option-card">
                  <el-radio :label="idx" class="option-radio">
                    <span class="option-label">{{ String.fromCharCode(65 + (idx as number)) }}</span>
                    <span class="option-text">{{ opt }}</span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>

            <div v-else-if="currentQuestion.type === 'multiple'" class="options-row">
              <el-checkbox-group v-model="answers[currentIndex]" class="option-group">
                <div v-for="(opt, idx) in currentQuestion.options" :key="idx" class="option-card">
                  <el-checkbox :label="idx" class="option-checkbox">
                    <span class="option-label">{{ String.fromCharCode(65 + (idx as number)) }}</span>
                    <span class="option-text">{{ opt }}</span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <div v-else-if="currentQuestion.type === 'judge'" class="options-row">
              <el-radio-group v-model="answers[currentIndex]" class="option-group">
                <div class="option-card">
                  <el-radio :label="1" class="option-radio">
                    <el-icon color="var(--color-cta)" :size="16"><CircleCheck /></el-icon>
                    <span class="option-text">正确</span>
                  </el-radio>
                </div>
                <div class="option-card">
                  <el-radio :label="0" class="option-radio">
                    <el-icon color="var(--color-danger)" :size="16"><CircleClose /></el-icon>
                    <span class="option-text">错误</span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>
          </div>

          <div class="progress-bar">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }" />
            </div>
          </div>

          <div class="actions">
            <el-button @click="prevQuestion" :disabled="currentIndex === 0" class="action-btn">
              <el-icon><ArrowLeft /></el-icon>上一题
            </el-button>
            <el-button
              v-if="currentIndex < questions.length - 1"
              type="primary"
              @click="nextQuestion"
              class="action-btn"
            >下一题<el-icon><ArrowRight /></el-icon></el-button>
            <el-button
              v-else
              type="success"
              @click="submitExam"
              :loading="submitting"
              class="action-btn submit-btn"
            >提交试卷</el-button>
          </div>
        </el-card>
      </template>

      <el-empty v-else description="暂无题目" />
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import request from '@/utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const examId = Number(route.params.id);
const loading = ref(true);
const examName = ref('');
const questions = ref<any[]>([]);
const answers = ref<any[]>([]);
const currentIndex = ref(0);
const submitting = ref(false);

const currentQuestion = computed(() => questions.value[currentIndex.value]);

const typeLabel = computed(() => {
  const t = currentQuestion.value?.type;
  if (t === 'single') return '单选题';
  if (t === 'multiple') return '多选题';
  if (t === 'judge') return '判断题';
  return '';
});

const typeClass = computed(() => {
  const t = currentQuestion.value?.type;
  if (t === 'single') return 'type-single';
  if (t === 'multiple') return 'type-multiple';
  if (t === 'judge') return 'type-judge';
  return '';
});

onMounted(() => {
  startExam();
});

async function startExam() {
  try {
    const res: any = await request.post('/examService.start', { exam_id: examId });
    if (res.code === 200) {
      questions.value = res.data.questions;
      answers.value = questions.value.map((q: any) => {
        if (q.type === 'multiple') return [];
        if (q.type === 'judge') return null;
        return null;
      });
    } else {
      ElMessage.error(res.message || '加载考试失败');
      router.push('/exams');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('加载考试失败');
    router.push('/exams');
  } finally {
    loading.value = false;
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  }
}

function getAnswerText(q: any, answer: any): string | string[] {
  if (q.type === 'single') {
    if (answer === null || answer === undefined) return '';
    return String.fromCharCode(65 + answer);
  }
  if (q.type === 'multiple') {
    if (!Array.isArray(answer) || answer.length === 0) return [];
    return answer.map((idx: number) => String.fromCharCode(65 + idx));
  }
  if (q.type === 'judge') {
    if (answer === null || answer === undefined) return '';
    return answer === 1 ? '正确' : '错误';
  }
  return '';
}

async function submitExam() {
  const unanswered = answers.value.map((a, i) => {
    if (Array.isArray(a)) return a.length === 0 ? i + 1 : null;
    return a === null || a === undefined ? i + 1 : null;
  }).filter(x => x !== null);

  if (unanswered.length > 0) {
    try {
      await ElMessageBox.confirm(
        `您还有 ${unanswered.length} 道题未作答（第 ${unanswered.join('、')} 题），确定要提交吗？`,
        '提示',
        { confirmButtonText: '确定提交', cancelButtonText: '继续答题', type: 'warning' }
      );
    } catch {
      return;
    }
  }

  const textAnswers = questions.value.map((q, i) => getAnswerText(q, answers.value[i]));

  submitting.value = true;
  try {
    const res: any = await request.post('/examService.submit', {
      exam_id: examId,
      answers: textAnswers,
    });
    if (res.code === 200) {
      router.push({
        path: `/exams/${examId}/result`,
        query: {
          score: res.data.score,
          is_passed: res.data.is_passed ? '1' : '0',
        },
      });
    } else {
      ElMessage.error(res.message || '提交失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('提交失败');
  } finally {
    submitting.value = false;
  }
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
  max-width: 960px;
  margin: 0 auto;
}
.exam-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.exam-card :deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-divider);
}
.exam-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.exam-name {
  font-weight: 700;
  font-size: 18px;
  color: var(--color-text);
  font-family: var(--font-heading);
}
.header-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-tag {
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
}
.type-tag.type-single {
  background: var(--color-info-bg);
  color: var(--color-info);
}
.type-tag.type-multiple {
  background: var(--color-purple-bg);
  color: var(--color-purple);
}
.type-tag.type-judge {
  background: var(--color-success-bg);
  color: var(--color-cta);
}
.progress-tag {
  border-radius: 8px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border: none;
  font-weight: 600;
  font-size: 13px;
}
.question-content {
  padding: 24px 0;
}
.question-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 24px;
  line-height: 1.7;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.options-row {
  display: flex;
  gap: 12px;
}
.option-group {
  display: flex;
  gap: 12px;
  width: 100%;
}
.option-group :deep(.el-radio-group),
.option-group :deep(.el-checkbox-group) {
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}
.option-card {
  flex: 1;
  min-width: 0;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  transition: all 0.2s ease;
  cursor: pointer;
}
.option-card:hover {
  border-color: var(--color-secondary);
  background: var(--color-primary-hover-bg);
}
.option-radio,
.option-checkbox {
  width: 100%;
}
.option-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 600;
  font-size: 13px;
  margin-right: 10px;
  flex-shrink: 0;
}
.option-text {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
  word-break: break-word;
}
.progress-bar {
  margin: 20px 0;
}
.progress-track {
  height: 4px;
  background: var(--color-divider);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 2px;
  transition: width 0.3s ease;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--color-divider);
}
.action-btn {
  border-radius: var(--radius-sm);
  min-width: 120px;
  font-weight: 500;
}
.submit-btn {
  background: var(--color-primary);
  border: none;
}
.submit-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
}
</style>
