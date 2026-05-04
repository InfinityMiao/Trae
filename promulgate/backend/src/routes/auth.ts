import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import { success, error, locked } from '../utils/response';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const employeeRepo = () => AppDataSource.getRepository(Employee);

function generateToken(employee: Employee): string {
  return jwt.sign(
    {
      id: employee.id,
      employee_no: employee.employee_no,
      employee_type: employee.employee_type,
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'] }
  );
}

function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber;
}

function getLockMinutes(failCount: number): number {
  if (failCount >= 10) return 60;
  if (failCount >= 5) return 30;
  if (failCount >= 3) return 5;
  return 0;
}

router.post('/authService.login', async (req, res) => {
  try {
    const { employee_no, password } = req.body;

    if (!employee_no || !password) {
      res.status(400).json(error('工资编号和密码不能为空'));
      return;
    }

    const employee = await employeeRepo().findOne({
      where: { employee_no },
      relations: ['department', 'position'],
    });

    if (!employee) {
      res.status(400).json(error('工资编号或密码错误'));
      return;
    }

    if (employee.status === 'disabled') {
      res.status(403).json(error('账号已被禁用', 403));
      return;
    }

    if (employee.lock_until && new Date(employee.lock_until) > new Date()) {
      const minutes = Math.ceil((new Date(employee.lock_until).getTime() - Date.now()) / 60000);
      res.status(423).json(locked(`账号已锁定，请${minutes}分钟后重试`, minutes));
      return;
    }

    const isValid = await bcrypt.compare(password, employee.password_hash);
    if (!isValid) {
      employee.login_fail_count += 1;
      const lockMinutes = getLockMinutes(employee.login_fail_count);
      if (lockMinutes > 0) {
        employee.lock_until = new Date(Date.now() + lockMinutes * 60000);
      }
      await employeeRepo().save(employee);

      if (lockMinutes > 0) {
        res.status(423).json(locked(`账号已锁定，请${lockMinutes}分钟后重试`, lockMinutes));
      } else {
        res.status(400).json(error('工资编号或密码错误'));
      }
      return;
    }

    employee.login_fail_count = 0;
    employee.lock_until = null;
    await employeeRepo().save(employee);

    const token = generateToken(employee);
    res.json(success({
      token,
      employee_type: employee.employee_type,
      first_login: employee.first_login === 1,
    }));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/authService.changePassword', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      res.status(400).json(error('旧密码和新密码不能为空'));
      return;
    }

    if (!validatePassword(new_password)) {
      res.status(400).json(error('密码长度至少8位，必须包含大写字母、小写字母和数字'));
      return;
    }

    const employee = await employeeRepo().findOne({ where: { id: req.user!.id } });
    if (!employee) {
      res.status(401).json(error('用户不存在', 401));
      return;
    }

    const isValid = await bcrypt.compare(old_password, employee.password_hash);
    if (!isValid) {
      res.status(400).json(error('旧密码错误'));
      return;
    }

    employee.password_hash = await bcrypt.hash(new_password, 10);
    employee.first_login = 0;
    await employeeRepo().save(employee);

    res.json(success(null));
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/authService.resetPassword', async (req, res) => {
  try {
    const { employee_no, id_card_last6, new_password } = req.body;

    if (!employee_no || !id_card_last6 || !new_password) {
      res.status(400).json(error('参数不完整'));
      return;
    }

    if (!validatePassword(new_password)) {
      res.status(400).json(error('密码长度至少8位，必须包含大写字母、小写字母和数字'));
      return;
    }

    const employee = await employeeRepo().findOne({ where: { employee_no } });
    if (!employee) {
      res.status(400).json(error('工资编号不存在'));
      return;
    }

    if (employee.id_card_last6 !== id_card_last6) {
      res.status(400).json(error('身份证后六位验证失败'));
      return;
    }

    employee.password_hash = await bcrypt.hash(new_password, 10);
    employee.first_login = 0;
    employee.login_fail_count = 0;
    employee.lock_until = null;
    await employeeRepo().save(employee);

    res.json(success(null));
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/authService.getUserInfo', requireAuth, async (req: AuthRequest, res) => {
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
      id: employee.id,
      name: employee.name,
      employee_no: employee.employee_no,
      employee_type: employee.employee_type,
      department_id: employee.department_id,
      department_name: employee.department?.name || null,
      position_id: employee.position_id,
      position_name: employee.position?.name || null,
    }));
  } catch (err) {
    console.error('Get user info error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
