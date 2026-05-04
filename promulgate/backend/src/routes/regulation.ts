import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { AppDataSource } from '../config/database';
import { Regulation } from '../entities/Regulation';
import { RegulationCategory } from '../entities/RegulationCategory';
import { RegulationPermission } from '../entities/RegulationPermission';
import { RegulationVersion } from '../entities/RegulationVersion';
import { EmployeeLearning } from '../entities/EmployeeLearning';
import { Notification } from '../entities/Notification';
import { Employee } from '../entities/Employee';
import { Department } from '../entities/Department';
import { Position } from '../entities/Position';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const regulationRepo = () => AppDataSource.getRepository(Regulation);
const categoryRepo = () => AppDataSource.getRepository(RegulationCategory);
const permissionRepo = () => AppDataSource.getRepository(RegulationPermission);
const versionRepo = () => AppDataSource.getRepository(RegulationVersion);
const learningRepo = () => AppDataSource.getRepository(EmployeeLearning);
const notificationRepo = () => AppDataSource.getRepository(Notification);
const employeeRepo = () => AppDataSource.getRepository(Employee);

const uploadsDir = path.join(__dirname, '../../uploads/regulations');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/regulationService.list', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category_id, keyword, learn_status, page = 1, pageSize = 20 } = req.body;
    const user = req.user!;

    const query = regulationRepo().createQueryBuilder('r')
      .leftJoinAndSelect('r.category', 'c')
      .where('r.status = :status', { status: 'online' })
      .andWhere('r.is_latest = 1')
      .orderBy('r.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (category_id) {
      query.andWhere('r.category_id = :category_id', { category_id });
    }
    if (keyword) {
      query.andWhere('(r.title LIKE :kw OR r.summary LIKE :kw)', { kw: `%${keyword}%` });
    }

    const [list, total] = await query.getManyAndCount();

    const emp = await employeeRepo().findOne({ where: { id: user.id }, relations: ['department', 'position'] });
    const deptId = emp?.department_id;
    const posId = emp?.position_id;

    const result = await Promise.all(list.map(async (r) => {
      const perms = await permissionRepo().find({ where: { regulation_id: r.id } });
      const isRequired = perms.some((p) =>
        (p.target_type === 'department' && p.target_id === deptId) ||
        (p.target_type === 'position' && p.target_id === posId)
      );
      const learning = await learningRepo().findOne({ where: { employee_id: user.id, regulation_id: r.id } });
      const isCompleted = learning?.is_completed === 1;

      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        category_id: r.category_id,
        category_name: r.category?.name || '',
        status: r.status,
        is_required: isRequired,
        is_completed: isCompleted,
        has_exam: false,
        updated_at: r.updated_at,
      };
    }));

    let filtered = result;
    if (learn_status === 'required') filtered = result.filter((r) => r.is_required);
    if (learn_status === 'unfinished') filtered = result.filter((r) => r.is_required && !r.is_completed);
    if (learn_status === 'completed') filtered = result.filter((r) => r.is_completed);

    res.json(success({ list: filtered, total, page, pageSize }));
  } catch (err) {
    console.error('Regulation list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.adminList', requireAdmin, async (req, res) => {
  try {
    const { category_id, keyword, status, page = 1, pageSize = 20 } = req.body;
    const query = regulationRepo().createQueryBuilder('r')
      .leftJoinAndSelect('r.category', 'c')
      .orderBy('r.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (category_id) {
      query.andWhere('r.category_id = :category_id', { category_id });
    }
    if (keyword) {
      query.andWhere('(r.title LIKE :kw OR r.summary LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) {
      query.andWhere('r.status = :status', { status });
    }

    const [rows, total] = await query.getManyAndCount();
    const list = rows.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      category_id: r.category_id,
      category_name: r.category?.name || '',
      pdf_url: r.pdf_url,
      status: r.status,
      version: r.version,
      is_latest: r.is_latest,
      created_at: r.created_at,
    }));
    res.json(success({ list, total, page, pageSize }));
  } catch (err) {
    console.error('Regulation admin list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.create', requireAdmin, upload.single('pdf'), async (req, res) => {
  try {
    const { title, summary, category_id } = req.body;
    if (!title || !req.file) {
      res.status(400).json(error('标题和PDF文件不能为空'));
      return;
    }
    const regulation = regulationRepo().create({
      title: title.trim(),
      summary: summary?.trim() || null,
      category_id: category_id || null,
      pdf_url: `/uploads/regulations/${req.file.filename}`,
      status: 'offline',
      version: 1,
      is_latest: 1,
    });
    await regulationRepo().save(regulation);
    res.json(success({ id: regulation.id }));
  } catch (err) {
    console.error('Regulation create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.update', requireAdmin, upload.single('pdf'), async (req, res) => {
  try {
    const { id, title, summary, category_id } = req.body;
    if (!id || !title) {
      res.status(400).json(error('制度ID和标题不能为空'));
      return;
    }
    const regulation = await regulationRepo().findOne({ where: { id } });
    if (!regulation) {
      res.status(400).json(error('制度不存在'));
      return;
    }
    regulation.title = title.trim();
    regulation.summary = summary?.trim() || null;
    regulation.category_id = category_id || null;
    if (req.file) {
      regulation.pdf_url = `/uploads/regulations/${req.file.filename}`;
    }
    await regulationRepo().save(regulation);
    res.json(success(null));
  } catch (err) {
    console.error('Regulation update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.updateStatus', requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status || !['online', 'offline'].includes(status)) {
      res.status(400).json(error('制度ID和状态不能为空'));
      return;
    }
    const regulation = await regulationRepo().findOne({ where: { id } });
    if (!regulation) {
      res.status(400).json(error('制度不存在'));
      return;
    }
    const wasOffline = regulation.status === 'offline';
    regulation.status = status;
    await regulationRepo().save(regulation);

    if (wasOffline && status === 'online') {
      const perms = await permissionRepo().find({ where: { regulation_id: id } });
      const deptIds = perms.filter((p) => p.target_type === 'department').map((p) => p.target_id);
      const posIds = perms.filter((p) => p.target_type === 'position').map((p) => p.target_id);

      const employees = await employeeRepo().find({
        where: [
          ...(deptIds.length > 0 ? deptIds.map((did) => ({ department_id: did })) : []),
          ...(posIds.length > 0 ? posIds.map((pid) => ({ position_id: pid })) : []),
        ] as any,
      });

      const uniqueEmps = Array.from(new Map(employees.map((e) => [e.id, e])).values());
      const notifications = uniqueEmps.map((e) =>
        notificationRepo().create({
          employee_id: e.id,
          title: '新制度上架',
          content: `《${regulation.title}》已上线，请及时学习`,
          is_read: 0,
        })
      );
      if (notifications.length > 0) {
        await notificationRepo().save(notifications);
      }
    }

    res.json(success(null));
  } catch (err) {
    console.error('Regulation update status error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.getPdf', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('制度ID不能为空'));
      return;
    }
    const regulation = await regulationRepo().findOne({ where: { id } });
    if (!regulation) {
      res.status(400).json(error('制度不存在'));
      return;
    }
    const filePath = path.join(__dirname, '../..', regulation.pdf_url);
    if (!fs.existsSync(filePath)) {
      res.status(404).json(error('PDF文件不存在'));
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Regulation get pdf error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.updateProgress', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { regulation_id } = req.body;
    if (!regulation_id) {
      res.status(400).json(error('制度ID不能为空'));
      return;
    }
    let learning = await learningRepo().findOne({
      where: { employee_id: req.user!.id, regulation_id },
    });
    if (!learning) {
      learning = learningRepo().create({
        employee_id: req.user!.id,
        regulation_id,
        is_completed: 1,
        completed_at: new Date(),
      });
    } else {
      learning.is_completed = 1;
      learning.completed_at = new Date();
    }
    await learningRepo().save(learning);
    res.json(success(null));
  } catch (err) {
    console.error('Regulation update progress error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.permissions', requireAdmin, async (req, res) => {
  try {
    const { regulation_id } = req.body;
    if (!regulation_id) {
      res.status(400).json(error('制度ID不能为空'));
      return;
    }
    const perms = await permissionRepo().find({ where: { regulation_id } });
    const departments = perms.filter((p) => p.target_type === 'department').map((p) => p.target_id);
    const positions = perms.filter((p) => p.target_type === 'position').map((p) => p.target_id);
    res.json(success({ departments, positions }));
  } catch (err) {
    console.error('Regulation permissions error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.updatePermissions', requireAdmin, async (req, res) => {
  try {
    const { regulation_id, departments = [], positions = [] } = req.body;
    if (!regulation_id) {
      res.status(400).json(error('制度ID不能为空'));
      return;
    }
    await permissionRepo().delete({ regulation_id });
    const newPerms: RegulationPermission[] = [];
    for (const deptId of departments) {
      newPerms.push(permissionRepo().create({ regulation_id, target_type: 'department', target_id: deptId }));
    }
    for (const posId of positions) {
      newPerms.push(permissionRepo().create({ regulation_id, target_type: 'position', target_id: posId }));
    }
    if (newPerms.length > 0) {
      await permissionRepo().save(newPerms);
    }
    res.json(success(null));
  } catch (err) {
    console.error('Regulation update permissions error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationService.get', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('制度ID不能为空'));
      return;
    }
    const regulation = await regulationRepo().findOne({
      where: { id },
      relations: ['category'],
    });
    if (!regulation) {
      res.status(404).json(error('制度不存在'));
      return;
    }
    res.json(success({
      id: regulation.id,
      title: regulation.title,
      content: regulation.summary || '',
      category_id: regulation.category_id,
      category_name: regulation.category?.name || '',
      pdf_url: regulation.pdf_url,
      status: regulation.status,
      version: regulation.version,
      created_at: regulation.created_at,
      updated_at: regulation.updated_at,
    }));
  } catch (err) {
    console.error('Regulation get error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
