import { Router } from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import { Department } from '../entities/Department';
import { Position } from '../entities/Position';
import { success, error } from '../utils/response';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const employeeRepo = () => AppDataSource.getRepository(Employee);
const departmentRepo = () => AppDataSource.getRepository(Department);
const positionRepo = () => AppDataSource.getRepository(Position);

const upload = multer({ storage: multer.memoryStorage() });

router.post('/employeeService.import', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json(error('请上传文件'));
      return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer as any);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      res.status(400).json(error('无法读取Excel文件'));
      return;
    }

    const errors: { row: number; reason: string }[] = [];
    let successCount = 0;

    const departments = await departmentRepo().find();
    const positions = await positionRepo().find();
    const deptMap = new Map(departments.map((d) => [d.name, d.id]));
    const posMap = new Map(positions.map((p) => [`${p.name}@${deptMap.get(departments.find((d) => d.id === p.department_id)?.name || '') || ''}`, p.id]));

    const rows: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      rows.push({ rowNumber, values: row.values });
    });

    for (const { rowNumber, values } of rows) {
      const name = values[1]?.toString().trim();
      const employeeNo = values[2]?.toString().trim();
      const idCardLast6 = values[3]?.toString().trim();
      const deptName = values[4]?.toString().trim();
      const posName = values[5]?.toString().trim();
      const type = values[6]?.toString().trim() || '员工';

      if (!name || !employeeNo || !idCardLast6) {
        errors.push({ row: rowNumber, reason: '姓名、工资编号或身份证后六位为空' });
        continue;
      }

      if (idCardLast6.length !== 6) {
        errors.push({ row: rowNumber, reason: '身份证后六位必须为6位' });
        continue;
      }

      const existing = await employeeRepo().findOne({ where: { employee_no: employeeNo } });
      if (existing) {
        errors.push({ row: rowNumber, reason: '工资编号已存在' });
        continue;
      }

      let departmentId: number | null = null;
      let positionId: number | null = null;

      if (deptName) {
        const deptId = deptMap.get(deptName);
        if (!deptId) {
          errors.push({ row: rowNumber, reason: `部门"${deptName}"不存在` });
          continue;
        }
        departmentId = deptId;
      }

      if (posName && departmentId) {
        const posId = posMap.get(`${posName}@${deptName}`);
        if (!posId) {
          errors.push({ row: rowNumber, reason: `岗位"${posName}"在部门"${deptName}"下不存在` });
          continue;
        }
        positionId = posId;
      }

      const employeeType = type === '管理员' ? 'admin' : 'employee';

      if (employeeType === 'employee' && (!departmentId || !positionId)) {
        errors.push({ row: rowNumber, reason: '普通员工必须选择部门和岗位' });
        continue;
      }

      try {
        const passwordHash = await bcrypt.hash(idCardLast6, 10);
        const employee = employeeRepo().create({
          name,
          employee_no: employeeNo,
          id_card_last6: idCardLast6,
          password_hash: passwordHash,
          employee_type: employeeType,
          department_id: departmentId,
          position_id: positionId,
          status: 'active',
          first_login: 1,
          login_fail_count: 0,
          lock_until: null,
        });
        await employeeRepo().save(employee);
        successCount++;
      } catch (err) {
        errors.push({ row: rowNumber, reason: '保存失败' });
      }
    }

    res.json(success({
      success_count: successCount,
      fail_count: errors.length,
      errors,
    }));
  } catch (err) {
    console.error('Employee import error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/employeeService.importTemplate', requireAdmin, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('员工导入模板');

    worksheet.columns = [
      { header: '姓名', key: 'name', width: 15 },
      { header: '工资编号', key: 'employee_no', width: 15 },
      { header: '身份证后六位', key: 'id_card_last6', width: 15 },
      { header: '部门', key: 'department', width: 15 },
      { header: '岗位', key: 'position', width: 15 },
      { header: '用户类型（员工/管理员）', key: 'type', width: 25 },
    ];

    worksheet.addRow({
      name: '张三',
      employee_no: 'A001',
      id_card_last6: '123456',
      department: '技术部',
      position: '工程师',
      type: '员工',
    });

    worksheet.addRow({
      name: '李四',
      employee_no: 'A002',
      id_card_last6: '654321',
      department: '人事部',
      position: 'HR专员',
      type: '员工',
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employee_import_template.xlsx');
    res.send(buffer);
  } catch (err) {
    console.error('Import template error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
