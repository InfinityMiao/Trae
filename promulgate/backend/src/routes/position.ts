import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Position } from '../entities/Position';
import { Department } from '../entities/Department';
import { Employee } from '../entities/Employee';
import { success, error } from '../utils/response';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const positionRepo = () => AppDataSource.getRepository(Position);
const departmentRepo = () => AppDataSource.getRepository(Department);
const employeeRepo = () => AppDataSource.getRepository(Employee);

router.post('/positionService.list', requireAdmin, async (req, res) => {
  try {
    const { department_id } = req.body;
    const where: any = {};
    if (department_id) {
      where.department_id = department_id;
    }
    const positions = await positionRepo().find({
      where,
      relations: ['department'],
    });
    const result = await Promise.all(
      positions.map(async (pos) => {
        const employeeCount = await employeeRepo().count({ where: { position_id: pos.id } });
        return {
          id: pos.id,
          name: pos.name,
          department_id: pos.department_id,
          department_name: pos.department?.name || '',
          employee_count: employeeCount,
        };
      })
    );
    res.json(success(result));
  } catch (err) {
    console.error('Position list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/positionService.create', requireAdmin, async (req, res) => {
  try {
    const { name, department_id } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json(error('岗位名称不能为空'));
      return;
    }
    if (!department_id) {
      res.status(400).json(error('所属部门不能为空'));
      return;
    }
    const dept = await departmentRepo().findOne({ where: { id: department_id } });
    if (!dept) {
      res.status(400).json(error('部门不存在'));
      return;
    }
    const pos = positionRepo().create({ name: name.trim(), department_id });
    await positionRepo().save(pos);
    res.json(success({ id: pos.id }));
  } catch (err) {
    console.error('Position create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/positionService.update', requireAdmin, async (req, res) => {
  try {
    const { id, name, department_id } = req.body;
    if (!id || !name || name.trim().length === 0 || !department_id) {
      res.status(400).json(error('岗位ID、名称和所属部门不能为空'));
      return;
    }
    const pos = await positionRepo().findOne({ where: { id } });
    if (!pos) {
      res.status(400).json(error('岗位不存在'));
      return;
    }
    const dept = await departmentRepo().findOne({ where: { id: department_id } });
    if (!dept) {
      res.status(400).json(error('部门不存在'));
      return;
    }
    pos.name = name.trim();
    pos.department_id = department_id;
    await positionRepo().save(pos);
    res.json(success(null));
  } catch (err) {
    console.error('Position update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/positionService.delete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('岗位ID不能为空'));
      return;
    }
    const employeeCount = await employeeRepo().count({ where: { position_id: id } });
    if (employeeCount > 0) {
      res.status(400).json(error('该岗位下存在关联员工，无法删除'));
      return;
    }
    await positionRepo().delete(id);
    res.json(success(null));
  } catch (err) {
    console.error('Position delete error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
