import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import { Department } from '../entities/Department';
import { Position } from '../entities/Position';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const employeeRepo = () => AppDataSource.getRepository(Employee);
const departmentRepo = () => AppDataSource.getRepository(Department);
const positionRepo = () => AppDataSource.getRepository(Position);

router.post('/employeeService.list', requireAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, name, department_id, position_id, status, employee_type } = req.body;
    const query = employeeRepo().createQueryBuilder('e')
      .leftJoinAndSelect('e.department', 'd')
      .leftJoinAndSelect('e.position', 'p')
      .orderBy('e.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (name) {
      query.andWhere('e.name LIKE :name', { name: `%${name}%` });
    }
    if (department_id) {
      query.andWhere('e.department_id = :department_id', { department_id });
    }
    if (position_id) {
      query.andWhere('e.position_id = :position_id', { position_id });
    }
    if (status) {
      query.andWhere('e.status = :status', { status });
    }
    if (employee_type) {
      query.andWhere('e.employee_type = :employee_type', { employee_type });
    }

    const [list, total] = await query.getManyAndCount();

    const result = list.map((e) => ({
      id: e.id,
      name: e.name,
      employee_no: e.employee_no,
      department_id: e.department_id,
      department_name: e.department?.name || null,
      position_id: e.position_id,
      position_name: e.position?.name || null,
      status: e.status,
      employee_type: e.employee_type,
      first_login: e.first_login,
      created_at: e.created_at,
    }));

    res.json(success({ list: result, total, page, pageSize }));
  } catch (err) {
    console.error('Employee list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/employeeService.create', requireAdmin, async (req, res) => {
  try {
    const { name, employee_no, id_card_last6, department_id, position_id, employee_type = 'employee' } = req.body;

    if (!name || !employee_no || !id_card_last6) {
      res.status(400).json(error('姓名、工资编号和身份证后六位不能为空'));
      return;
    }

    if (id_card_last6.length !== 6) {
      res.status(400).json(error('身份证后六位必须为6位'));
      return;
    }

    const existing = await employeeRepo().findOne({ where: { employee_no } });
    if (existing) {
      res.status(400).json(error('工资编号已存在'));
      return;
    }

    if (employee_type === 'employee') {
      if (!department_id || !position_id) {
        res.status(400).json(error('普通员工必须选择部门和岗位'));
        return;
      }
    }

    if (department_id) {
      const dept = await departmentRepo().findOne({ where: { id: department_id } });
      if (!dept) {
        res.status(400).json(error('部门不存在'));
        return;
      }
    }

    if (position_id) {
      const pos = await positionRepo().findOne({ where: { id: position_id } });
      if (!pos) {
        res.status(400).json(error('岗位不存在'));
        return;
      }
    }

    const passwordHash = await bcrypt.hash(id_card_last6, 10);
    const employee = employeeRepo().create({
      name: name.trim(),
      employee_no: employee_no.trim(),
      id_card_last6,
      password_hash: passwordHash,
      employee_type,
      department_id: department_id || null,
      position_id: position_id || null,
      status: 'active',
      first_login: 1,
      login_fail_count: 0,
      lock_until: null,
    });

    await employeeRepo().save(employee);
    res.json(success({ id: employee.id }));
  } catch (err) {
    console.error('Employee create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/employeeService.update', requireAdmin, async (req, res) => {
  try {
    const { id, name, department_id, position_id, employee_type } = req.body;

    if (!id || !name || name.trim().length === 0) {
      res.status(400).json(error('员工ID和姓名不能为空'));
      return;
    }

    const employee = await employeeRepo().findOne({ where: { id } });
    if (!employee) {
      res.status(400).json(error('员工不存在'));
      return;
    }

    if (employee_type === 'employee') {
      if (!department_id || !position_id) {
        res.status(400).json(error('普通员工必须选择部门和岗位'));
        return;
      }
    }

    if (department_id) {
      const dept = await departmentRepo().findOne({ where: { id: department_id } });
      if (!dept) {
        res.status(400).json(error('部门不存在'));
        return;
      }
    }

    if (position_id) {
      const pos = await positionRepo().findOne({ where: { id: position_id } });
      if (!pos) {
        res.status(400).json(error('岗位不存在'));
        return;
      }
    }

    employee.name = name.trim();
    employee.employee_type = employee_type;
    employee.department_id = department_id || null;
    employee.position_id = position_id || null;

    await employeeRepo().save(employee);
    res.json(success(null));
  } catch (err) {
    console.error('Employee update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/employeeService.updateStatus', requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status || !['active', 'disabled'].includes(status)) {
      res.status(400).json(error('员工ID和状态不能为空'));
      return;
    }

    const employee = await employeeRepo().findOne({ where: { id } });
    if (!employee) {
      res.status(400).json(error('员工不存在'));
      return;
    }

    employee.status = status;
    await employeeRepo().save(employee);
    res.json(success(null));
  } catch (err) {
    console.error('Employee update status error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/employeeService.resetPassword', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('员工ID不能为空'));
      return;
    }

    const employee = await employeeRepo().findOne({ where: { id } });
    if (!employee) {
      res.status(400).json(error('员工不存在'));
      return;
    }

    employee.password_hash = await bcrypt.hash(employee.id_card_last6, 10);
    employee.first_login = 1;
    employee.login_fail_count = 0;
    employee.lock_until = null;
    await employeeRepo().save(employee);

    res.json(success(null));
  } catch (err) {
    console.error('Employee reset password error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/employeeService.getProfile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const employee = await employeeRepo().findOne({
      where: { id: req.user!.id },
      relations: ['department', 'position'],
    });

    if (!employee) {
      res.status(401).json(error('用户不存在', 401));
      return;
    }

    res.json(success({
      name: employee.name,
      employee_no: employee.employee_no,
      department_name: employee.department?.name || null,
      position_name: employee.position?.name || null,
    }));
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
