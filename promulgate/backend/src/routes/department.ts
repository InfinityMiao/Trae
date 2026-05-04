import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Department } from '../entities/Department';
import { Position } from '../entities/Position';
import { Employee } from '../entities/Employee';
import { success, error } from '../utils/response';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const departmentRepo = () => AppDataSource.getRepository(Department);
const positionRepo = () => AppDataSource.getRepository(Position);
const employeeRepo = () => AppDataSource.getRepository(Employee);

router.post('/departmentService.list', requireAdmin, async (req, res) => {
  try {
    const departments = await departmentRepo().find();
    const result = await Promise.all(
      departments.map(async (dept) => {
        const positionCount = await positionRepo().count({ where: { department_id: dept.id } });
        const employeeCount = await employeeRepo().count({ where: { department_id: dept.id } });
        return {
          id: dept.id,
          name: dept.name,
          position_count: positionCount,
          employee_count: employeeCount,
        };
      })
    );
    res.json(success(result));
  } catch (err) {
    console.error('Department list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/departmentService.create', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json(error('部门名称不能为空'));
      return;
    }
    const dept = departmentRepo().create({ name: name.trim() });
    await departmentRepo().save(dept);
    res.json(success({ id: dept.id }));
  } catch (err) {
    console.error('Department create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/departmentService.update', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name || name.trim().length === 0) {
      res.status(400).json(error('部门ID和名称不能为空'));
      return;
    }
    const dept = await departmentRepo().findOne({ where: { id } });
    if (!dept) {
      res.status(400).json(error('部门不存在'));
      return;
    }
    dept.name = name.trim();
    await departmentRepo().save(dept);
    res.json(success(null));
  } catch (err) {
    console.error('Department update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/departmentService.delete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('部门ID不能为空'));
      return;
    }
    const positionCount = await positionRepo().count({ where: { department_id: id } });
    const employeeCount = await employeeRepo().count({ where: { department_id: id } });
    if (positionCount > 0 || employeeCount > 0) {
      res.status(400).json(error('该部门下存在关联岗位或员工，无法删除'));
      return;
    }
    await departmentRepo().delete(id);
    res.json(success(null));
  } catch (err) {
    console.error('Department delete error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
