<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">员工管理</h1>
        <p class="page-desc">管理企业员工账号与组织架构关系</p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.push('/admin/employees/import')">
          <el-icon><Upload /></el-icon>批量导入
        </el-button>
        <el-button type="primary" class="btn-primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>创建员工
        </el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-bar">
        <el-input v-model="filters.name" placeholder="姓名" clearable style="width: 160px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filters.department_id" placeholder="部门" clearable style="width: 160px">
          <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
        <el-select v-model="filters.position_id" placeholder="岗位" clearable style="width: 160px">
          <el-option v-for="p in positions" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-select v-model="filters.employee_type" placeholder="类型" clearable style="width: 120px">
          <el-option label="管理员" value="admin" />
          <el-option label="员工" value="employee" />
        </el-select>
        <el-button type="primary" plain @click="loadData">
          <el-icon><Search /></el-icon>查询
        </el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never" style="margin-top: 16px">
      <el-table :data="employees" stripe v-loading="loading">
        <el-table-column prop="name" label="姓名" width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :style="{ background: row.employee_type === 'admin' ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' : 'linear-gradient(135deg, var(--color-blue), var(--color-blue-light))' }">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="employee_no" label="工资编号" width="200" />
        <el-table-column prop="department_name" label="部门">
          <template #default="{ row }">
            <el-tag v-if="row.department_name" size="small" effect="plain" type="info">{{ row.department_name }}</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="position_name" label="岗位">
          <template #default="{ row }">
            <el-tag v-if="row.position_name" size="small" effect="plain">{{ row.position_name }}</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <span class="status-dot" :class="row.status"></span>
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column prop="employee_type" label="类型" width="150">
          <template #default="{ row }">
            <el-tag size="small" :type="row.employee_type === 'admin' ? 'warning' : ''" effect="plain">
              {{ row.employee_type === 'admin' ? '管理员' : '员工' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" text :type="row.status === 'active' ? 'danger' : 'success'" @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" text @click="handleReset(row)">
              <el-icon><RefreshLeft /></el-icon>重置密码
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

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑员工' : '创建员工'" width="520px" class="custom-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="110px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="工资编号" prop="employee_no" v-if="!isEdit">
          <el-input v-model="form.employee_no" placeholder="请输入工资编号" />
        </el-form-item>
        <el-form-item label="身份证后6位" prop="id_card_last6" v-if="!isEdit">
          <el-input v-model="form.id_card_last6" maxlength="6" placeholder="初始密码" />
        </el-form-item>
        <el-form-item label="用户类型" prop="employee_type">
          <el-radio-group v-model="form.employee_type">
            <el-radio label="employee">员工</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门" prop="department_id">
          <el-select v-model="form.department_id" placeholder="选择部门" clearable style="width: 100%">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位" prop="position_id">
          <el-select v-model="form.position_id" placeholder="选择岗位" clearable style="width: 100%">
            <el-option v-for="p in positions" :key="p.id" :label="p.name" :value="p.id" />
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

const employees = ref<any[]>([]);
const departments = ref<any[]>([]);
const positions = ref<any[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const showDialog = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const loading = ref(false);
const formRef = ref();
const filters = ref({ name: '', department_id: '', position_id: '', status: '', employee_type: '' });
const form = ref({
  id: null as number | null,
  name: '',
  employee_no: '',
  id_card_last6: '',
  employee_type: 'employee',
  department_id: null as number | null,
  position_id: null as number | null,
});
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  employee_no: [{ required: true, message: '请输入工资编号', trigger: 'blur' }],
  id_card_last6: [{ required: true, len: 6, message: '请输入6位身份证后六位', trigger: 'blur' }],
};

async function loadData() {
  loading.value = true;
  const res: any = await request.post('/employeeService.list', {
    page: page.value,
    pageSize: pageSize.value,
    ...filters.value,
  });
  if (res.code === 200) {
    employees.value = res.data.list;
    total.value = res.data.total;
  }
  loading.value = false;
}

async function loadDepartments() {
  const res: any = await request.post('/departmentService.list', {});
  if (res.code === 200) departments.value = res.data;
}

async function loadPositions() {
  const res: any = await request.post('/positionService.list', {});
  if (res.code === 200) positions.value = res.data;
}

function resetFilters() {
  filters.value = { name: '', department_id: '', position_id: '', status: '', employee_type: '' };
  page.value = 1;
  loadData();
}

onMounted(() => {
  loadData();
  loadDepartments();
  loadPositions();
});

function handleEdit(row: any) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    name: row.name,
    employee_no: row.employee_no,
    id_card_last6: '',
    employee_type: row.employee_type,
    department_id: row.department_id,
    position_id: row.position_id,
  };
  showDialog.value = true;
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active';
  const res: any = await request.post('/employeeService.updateStatus', { id: row.id, status: newStatus });
  if (res.code === 200) {
    ElMessage.success('操作成功');
    loadData();
  } else {
    ElMessage.error(res.message);
  }
}

async function handleReset(row: any) {
  try {
    await ElMessageBox.confirm('确定重置该员工密码吗？', '提示', { type: 'warning' });
    const res: any = await request.post('/employeeService.resetPassword', { id: row.id });
    if (res.code === 200) {
      ElMessage.success('密码已重置为身份证后六位');
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.message || '重置失败');
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  const api = isEdit.value ? '/employeeService.update' : '/employeeService.create';
  const payload = isEdit.value
    ? { id: form.value.id, name: form.value.name, employee_type: form.value.employee_type, department_id: form.value.department_id, position_id: form.value.position_id }
    : form.value;
  const res: any = await request.post(api, payload);
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功');
    showDialog.value = false;
    form.value = { id: null, name: '', employee_no: '', id_card_last6: '', employee_type: 'employee', department_id: null, position_id: null };
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
.header-actions {
  display: flex;
  gap: 10px;
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
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-name {
  font-weight: 500;
  color: var(--color-text);
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.status-dot.active {
  background: var(--color-primary);
}
.status-dot.disabled {
  background: var(--color-danger);
}
.text-muted {
  color: var(--color-text-muted);
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
</style>
