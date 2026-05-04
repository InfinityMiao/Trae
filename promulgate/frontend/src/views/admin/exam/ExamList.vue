<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">考试管理</h1>
        <p class="page-desc">创建和管理在线考试内容</p>
      </div>
      <el-button type="primary" class="btn-primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>创建考试
      </el-button>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="exams" stripe v-loading="loading">
        <el-table-column prop="name" label="考试名称" />
        <el-table-column prop="description" label="说明" show-overflow-tooltip />
        <el-table-column prop="pass_score" label="及格分数线" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">{{ row.status === 'published' ? '已发布' : '已关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" text @click="handleToggle(row)">
              <el-icon><Switch /></el-icon>{{ row.status === 'published' ? '关闭' : '发布' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑考试' : '创建考试'" width="700px" class="custom-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="考试名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" rows="2" />
        </el-form-item>
        <el-form-item label="及格分数线" prop="pass_score">
          <el-input-number v-model="form.pass_score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="关联制度">
          <el-select v-model="form.regulation_ids" multiple placeholder="选择关联制度" style="width: 100%">
            <el-option v-for="r in regulations" :key="r.id" :label="r.title" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目" prop="content">
          <div v-for="(q, idx) in form.content.questions" :key="idx" class="question-item">
            <el-divider>第 {{ idx + 1 }} 题</el-divider>
            <el-form-item label="题型">
              <el-radio-group v-model="q.type">
                <el-radio label="single">单选</el-radio>
                <el-radio label="multiple">多选</el-radio>
                <el-radio label="judge">判断</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="题目">
              <el-input v-model="q.content" type="textarea" rows="2" />
            </el-form-item>
            <el-form-item label="选项" v-if="q.type !== 'judge'">
              <div v-for="(_, oidx) in q.options" :key="oidx" class="option-row">
                <el-input v-model="q.options[oidx as number]" style="width: 300px; margin-right: 8px" />
                <el-button size="small" @click="removeOption(idx, oidx as number)">删除</el-button>
              </div>
              <el-button size="small" @click="addOption(idx)">添加选项</el-button>
            </el-form-item>
            <el-form-item label="正确答案">
              <el-input v-model="q.answer" placeholder="单选填A/B/C/D，多选填A,C，判断填正确/错误" />
            </el-form-item>
            <el-form-item label="解析">
              <el-input v-model="q.explanation" type="textarea" rows="2" />
            </el-form-item>
            <el-button type="danger" size="small" @click="removeQuestion(idx)">删除本题</el-button>
          </div>
          <el-button type="primary" @click="addQuestion">添加题目</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" class="btn-primary" @click="handleSubmit" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

const exams = ref<any[]>([]);
const regulations = ref<any[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const showDialog = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const loading = ref(false);
const formRef = ref();
const form = ref({
  id: null as number | null,
  name: '',
  description: '',
  pass_score: 60,
  regulation_ids: [] as number[],
  content: { questions: [] as any[] },
});
const formRules = {
  name: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  pass_score: [{ required: true, message: '请输入及格分数线', trigger: 'blur' }],
};

async function loadData() {
  loading.value = true;
  try {
    const res: any = await request.post('/examService.adminList', { page: page.value, pageSize: pageSize.value });
    if (res.code === 200) {
      exams.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function loadRegulations() {
  const res: any = await request.post('/regulationService.adminList', { page: 1, pageSize: 999 });
  if (res.code === 200) {
    regulations.value = res.data.list;
  }
}

onMounted(() => {
  loadData();
  loadRegulations();
});

function addQuestion() {
  form.value.content.questions.push({
    type: 'single',
    content: '',
    options: ['A.', 'B.', 'C.', 'D.'],
    answer: '',
    explanation: '',
  });
}

function removeQuestion(idx: number) {
  form.value.content.questions.splice(idx, 1);
}

function addOption(qIdx: number) {
  form.value.content.questions[qIdx].options.push('');
}

function removeOption(qIdx: number, oIdx: number) {
  form.value.content.questions[qIdx].options.splice(oIdx, 1);
}

function handleEdit(row: any) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    name: row.name,
    description: row.description || '',
    pass_score: row.pass_score,
    regulation_ids: row.regulation_ids || [],
    content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
  };
  showDialog.value = true;
}

async function handleToggle(row: any) {
  const newStatus = row.status === 'published' ? 'closed' : 'published';
  const res: any = await request.post('/examService.updateStatus', { id: row.id, status: newStatus });
  if (res.code === 200) {
    ElMessage.success('操作成功');
    loadData();
  } else {
    ElMessage.error(res.message);
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;

  const payload = {
    id: form.value.id,
    name: form.value.name,
    description: form.value.description,
    pass_score: form.value.pass_score,
    regulation_ids: form.value.regulation_ids,
    content: form.value.content,
  };

  const api = isEdit.value ? '/examService.update' : '/examService.create';
  try {
    const res: any = await request.post(api, payload);
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
      showDialog.value = false;
      form.value = { id: null, name: '', description: '', pass_score: 60, regulation_ids: [], content: { questions: [] } };
      loadData();
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '提交失败');
  }
  submitting.value = false;
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 600;
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}
.table-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
}
.table-card :deep(.el-card__body) {
  padding: 0;
}
.table-card :deep(.el-table__header th) {
  background: var(--color-background);
  font-weight: 600;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
.pagination {
  padding: 16px 20px;
  justify-content: flex-end;
}
.custom-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-divider);
  margin-right: 0;
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.custom-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--color-divider);
}
.question-item {
  border: 1px solid var(--color-border);
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: var(--color-surface-hover);
}
.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>
