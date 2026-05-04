<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">制度管理</h1>
        <p class="page-desc">管理平台学习制度与文档内容</p>
      </div>
      <el-button type="primary" class="btn-primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>创建制度
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-bar">
        <el-select v-model="filters.category_id" placeholder="分类" clearable style="width: 150px">
          <el-option v-for="c in flatCategories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="关键词" style="width: 200px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="上线" value="online" />
          <el-option label="下线" value="offline" />
        </el-select>
        <el-button type="primary" plain @click="loadData">
          <el-icon><Search /></el-icon>查询
        </el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never" style="margin-top: 16px">
      <el-table :data="regulations" stripe v-loading="loading">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="summary" label="摘要" show-overflow-tooltip />
        <el-table-column prop="category_name" label="分类" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'info'">{{ row.status === 'online' ? '上线' : '下线' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column label="操作" width="280" align="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" text @click="handleToggle(row)">
              <el-icon><Switch /></el-icon>{{ row.status === 'online' ? '下线' : '上线' }}
            </el-button>
            <el-button size="small" text @click="handlePermissions(row)">
              <el-icon><SetUp /></el-icon>权限
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

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑制度' : '创建制度'" width="560px" class="custom-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入制度标题" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category_id" placeholder="选择分类" clearable style="width: 100%">
            <el-option v-for="c in flatCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="PDF文件" prop="pdf">
          <div v-if="isEdit && currentPdfUrl" class="current-pdf">
            <el-icon :size="18" color="var(--color-primary)"><Document /></el-icon>
            <span class="pdf-name">{{ currentPdfName }}</span>
            <el-link type="primary" :href="currentPdfUrl" target="_blank">查看</el-link>
            <el-tag v-if="!form.pdf" size="small" type="info" effect="plain">当前文件</el-tag>
            <el-tag v-else size="small" type="warning" effect="plain">待替换</el-tag>
          </div>
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".pdf"
            class="pdf-upload"
          >
            <el-button><el-icon><Document /></el-icon>{{ isEdit ? '替换PDF' : '选择PDF' }}</el-button>
          </el-upload>
        </el-form-item>

        <el-divider />

        <div class="perm-section">
          <div class="perm-section-title">
            <el-icon :size="16" color="var(--color-primary)"><SetUp /></el-icon>
            <span>关联部门与岗位</span>
          </div>
          <el-form-item label="关联部门">
            <el-select-v2
              v-model="form.departments"
              :options="departmentOptions"
              placeholder="选择关联部门"
              multiple
              clearable
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="关联岗位">
            <el-select-v2
              v-model="form.positions"
              :options="positionOptions"
              placeholder="选择关联岗位"
              multiple
              clearable
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" class="btn-primary" @click="handleSubmit" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPermissionDialog" title="设置权限" width="500px" class="custom-dialog">
      <el-form label-width="80px">
        <el-form-item label="部门">
          <el-checkbox-group v-model="permissionForm.departments">
            <el-checkbox v-for="d in departments" :key="d.id" :label="d.id">{{ d.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="岗位">
          <el-checkbox-group v-model="permissionForm.positions">
            <el-checkbox v-for="p in positions" :key="p.id" :label="p.id">{{ p.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPermissionDialog = false">取消</el-button>
        <el-button type="primary" class="btn-primary" @click="handleSavePermissions" :loading="permLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

const regulations = ref<any[]>([]);
const departments = ref<any[]>([]);
const positions = ref<any[]>([]);
const flatCategories = ref<any[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const showDialog = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const loading = ref(false);
const formRef = ref();
const filters = ref({ category_id: '', keyword: '', status: '' });
const form = ref({
  id: null as number | null,
  title: '',
  summary: '',
  category_id: null as number | null,
  pdf: null as File | null,
  departments: [] as number[],
  positions: [] as number[],
});
const currentPdfUrl = ref('');
const currentPdfName = ref('');
const formRules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] };

const departmentOptions = computed(() =>
  departments.value.map((d) => ({ value: d.id, label: d.name }))
);
const positionOptions = computed(() =>
  positions.value.map((p) => ({ value: p.id, label: p.name }))
);

const showPermissionDialog = ref(false);
const permLoading = ref(false);
const currentRegulationId = ref<number | null>(null);
const permissionForm = ref({ departments: [] as number[], positions: [] as number[] });

async function loadData() {
  loading.value = true;
  try {
    const res: any = await request.post('/regulationService.adminList', {
      page: page.value,
      pageSize: pageSize.value,
      ...filters.value,
    });
    if (res.code === 200) {
      regulations.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.value = { category_id: '', keyword: '', status: '' };
  page.value = 1;
  loadData();
}

async function loadCategories() {
  const res: any = await request.post('/regulationCategoryService.tree', {});
  if (res.code === 200) {
    flatCategories.value = flatten(res.data);
  }
}

async function loadDepartments() {
  const res: any = await request.post('/departmentService.list', {});
  if (res.code === 200) departments.value = res.data;
}

async function loadPositions() {
  const res: any = await request.post('/positionService.list', {});
  if (res.code === 200) positions.value = res.data;
}

function flatten(nodes: any[]): any[] {
  const result: any[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name });
    if (node.children) result.push(...flatten(node.children));
  }
  return result;
}

onMounted(() => {
  loadData();
  loadCategories();
  loadDepartments();
  loadPositions();
});

function handleFileChange(file: any) {
  form.value.pdf = file.raw;
}

async function handleEdit(row: any) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    title: row.title,
    summary: row.summary || '',
    category_id: row.category_id,
    pdf: null,
    departments: [],
    positions: [],
  };
  currentPdfUrl.value = row.pdf_url || '';
  currentPdfName.value = row.pdf_url ? row.pdf_url.split('/').pop() : '';

  const permRes: any = await request.post('/regulationService.permissions', { regulation_id: row.id });
  if (permRes.code === 200) {
    form.value.departments = permRes.data.departments;
    form.value.positions = permRes.data.positions;
  }

  showDialog.value = true;
}

async function handleToggle(row: any) {
  const newStatus = row.status === 'online' ? 'offline' : 'online';
  const res: any = await request.post('/regulationService.updateStatus', { id: row.id, status: newStatus });
  if (res.code === 200) {
    ElMessage.success('操作成功');
    loadData();
  } else {
    ElMessage.error(res.message);
  }
}

async function handlePermissions(row: any) {
  currentRegulationId.value = row.id;
  const res: any = await request.post('/regulationService.permissions', { regulation_id: row.id });
  if (res.code === 200) {
    permissionForm.value = { departments: res.data.departments, positions: res.data.positions };
    showPermissionDialog.value = true;
  }
}

async function handleSavePermissions() {
  permLoading.value = true;
  const res: any = await request.post('/regulationService.updatePermissions', {
    regulation_id: currentRegulationId.value,
    departments: permissionForm.value.departments,
    positions: permissionForm.value.positions,
  });
  if (res.code === 200) {
    ElMessage.success('权限设置成功');
    showPermissionDialog.value = false;
  } else {
    ElMessage.error(res.message);
  }
  permLoading.value = false;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;

  const fd = new FormData();
  if (form.value.id) fd.append('id', String(form.value.id));
  fd.append('title', form.value.title);
  fd.append('summary', form.value.summary || '');
  if (form.value.category_id) fd.append('category_id', String(form.value.category_id));
  if (form.value.pdf) fd.append('pdf', form.value.pdf);

  const api = isEdit.value ? '/regulationService.update' : '/regulationService.create';
  try {
    const res: any = await request.post(api, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.code === 200) {
      if (isEdit.value && form.value.id) {
        await request.post('/regulationService.updatePermissions', {
          regulation_id: form.value.id,
          departments: form.value.departments,
          positions: form.value.positions,
        });
      }
      ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
      showDialog.value = false;
      form.value = { id: null, title: '', summary: '', category_id: null, pdf: null, departments: [], positions: [] };
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
.filter-card {
  border-radius: 12px;
  border: 1px solid var(--color-border);
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
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
.current-pdf {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--color-background);
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid var(--color-border);
}
.pdf-name {
  font-size: 13px;
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pdf-upload :deep(.el-upload) {
  display: inline-block;
}
.perm-section {
  margin-top: 8px;
}
.perm-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text);
  margin-bottom: 16px;
}
</style>
