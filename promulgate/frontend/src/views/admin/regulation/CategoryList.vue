<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">制度分类管理</h1>
        <p class="page-desc">管理学习制度的分类层级结构</p>
      </div>
      <el-button type="primary" class="btn-primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>创建分类
      </el-button>
    </div>

    <el-card class="tree-card" shadow="never">
      <el-tree :data="treeData" :props="{ label: 'name', children: 'children' }" node-key="id" default-expand-all class="custom-tree">
        <template #default="{ node, data }">
          <span class="tree-node">
            <div class="tree-label">
              <el-icon :size="16" color="var(--color-primary)"><Folder /></el-icon>
              <span>{{ node.label }}</span>
              <span v-if="data.is_system" class="system-tag">系统</span>
            </div>
            <span class="tree-actions">
              <el-button size="small" text type="primary" @click="handleEdit(data)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button size="small" text type="danger" @click="handleDelete(data)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑分类' : '创建分类'" width="400px" class="custom-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="form.parent_id" placeholder="顶级分类" clearable style="width: 100%">
            <el-option v-for="c in flatCategories" :key="c.id" :label="c.name" :value="c.id" :disabled="c.id === form.id" />
          </el-select>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

const treeData = ref<any[]>([]);
const flatCategories = ref<any[]>([]);
const showDialog = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref();
const form = ref({ id: null as number | null, name: '', parent_id: null as number | null });
const formRules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] };

async function loadData() {
  const res: any = await request.post('/regulationCategoryService.tree', {});
  if (res.code === 200) {
    treeData.value = res.data;
    flatCategories.value = flatten(res.data);
  }
}

function flatten(nodes: any[]): any[] {
  const result: any[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name });
    if (node.children) {
      result.push(...flatten(node.children));
    }
  }
  return result;
}

onMounted(loadData);

function handleEdit(data: any) {
  isEdit.value = true;
  form.value = { id: data.id, name: data.name, parent_id: data.parent_id };
  showDialog.value = true;
}

async function handleDelete(data: any) {
  try {
    await ElMessageBox.confirm('确定删除该分类吗？子分类也会被删除。', '提示', { type: 'warning' });
    const res: any = await request.post('/regulationCategoryService.delete', { id: data.id });
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadData();
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.message || '删除失败');
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  const api = isEdit.value ? '/regulationCategoryService.update' : '/regulationCategoryService.create';
  const res: any = await request.post(api, form.value);
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
    showDialog.value = false;
    form.value = { id: null, name: '', parent_id: null };
    loadData();
  } else {
    ElMessage.error(res.message);
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
.tree-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
}
.tree-card :deep(.el-card__body) {
  padding: 20px;
}
.custom-tree :deep(.el-tree-node__content) {
  height: 44px;
  border-radius: 8px;
  padding-right: 8px;
  transition: all 0.2s ease;
}
.custom-tree :deep(.el-tree-node__content:hover) {
  background: var(--color-background);
}
.tree-node {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
}
.tree-label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.system-tag {
  margin-left: 4px;
  font-size: 11px;
  color: var(--color-danger);
  border: 1px solid var(--color-danger-light);
  background: var(--color-danger-bg);
  padding: 2px 6px;
  border-radius: 4px;
}
.tree-actions {
  margin-left: auto;
  padding-left: 16px;
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
</style>
