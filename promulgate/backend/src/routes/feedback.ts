import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/database';
import { Feedback } from '../entities/Feedback';
import { FeedbackReply } from '../entities/FeedbackReply';
import { FeedbackAttachment } from '../entities/FeedbackAttachment';
import { Notification } from '../entities/Notification';
import { Employee } from '../entities/Employee';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const feedbackRepo = () => AppDataSource.getRepository(Feedback);
const replyRepo = () => AppDataSource.getRepository(FeedbackReply);
const attachmentRepo = () => AppDataSource.getRepository(FeedbackAttachment);
const notificationRepo = () => AppDataSource.getRepository(Notification);
const employeeRepo = () => AppDataSource.getRepository(Employee);

const uploadsDir = path.join(__dirname, '../../uploads/feedbacks');
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
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/feedbackService.list', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.body;
    const [list, total] = await feedbackRepo().findAndCount({
      where: { employee_id: req.user!.id },
      relations: ['category'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const result = list.map((f) => ({
      id: f.id,
      title: f.title,
      content: f.content,
      status: f.status,
      category_id: f.category_id,
      category_name: f.category?.name || '',
      created_at: f.created_at,
    }));

    res.json(success({ list: result, total, page, pageSize }));
  } catch (err) {
    console.error('Feedback list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackService.create', requireAuth, upload.array('files', 5), async (req: AuthRequest, res) => {
  try {
    const { title, content, category_id } = req.body;
    if (!title || !content) {
      res.status(400).json(error('标题和内容不能为空'));
      return;
    }

    const feedback = feedbackRepo().create({
      employee_id: req.user!.id,
      category_id: category_id || null,
      title: title.trim(),
      content: content.trim(),
      status: 'pending',
    });
    await feedbackRepo().save(feedback);

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const attachments = files.map((file) =>
        attachmentRepo().create({
          feedback_id: feedback.id,
          file_url: `/uploads/feedbacks/${file.filename}`,
          file_name: file.originalname,
        })
      );
      await attachmentRepo().save(attachments);
    }

    const admins = await employeeRepo().find({ where: { employee_type: 'admin' } });
    const notifications = admins.map((a) =>
      notificationRepo().create({
        employee_id: a.id,
        title: '新反馈提交',
        content: `员工提交了反馈：${feedback.title}`,
        is_read: 0,
      })
    );
    if (notifications.length > 0) {
      await notificationRepo().save(notifications);
    }

    res.json(success({ id: feedback.id }));
  } catch (err) {
    console.error('Feedback create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackService.getDetail', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('反馈ID不能为空'));
      return;
    }
    const feedback = await feedbackRepo().findOne({
      where: { id },
      relations: ['category', 'employee'],
    });
    if (!feedback) {
      res.status(400).json(error('反馈不存在'));
      return;
    }

    const replies = await replyRepo().find({
      where: { feedback_id: id },
      relations: ['employee'],
      order: { created_at: 'ASC' },
    });

    const attachments = await attachmentRepo().find({ where: { feedback_id: id } });

    res.json(success({
      feedback: {
        id: feedback.id,
        title: feedback.title,
        content: feedback.content,
        status: feedback.status,
        category_id: feedback.category_id,
        category_name: feedback.category?.name || '',
        employee_name: feedback.employee?.name || '',
        created_at: feedback.created_at,
      },
      replies: replies.map((r) => ({
        id: r.id,
        content: r.content,
        employee_name: r.employee?.name || '',
        created_at: r.created_at,
      })),
      attachments: attachments.map((a) => ({
        id: a.id,
        file_url: a.file_url,
        file_name: a.file_name,
      })),
    }));
  } catch (err) {
    console.error('Feedback get detail error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackService.adminList', requireAdmin, async (req, res) => {
  try {
    const { status, category_id, page = 1, pageSize = 20 } = req.body;
    const query = feedbackRepo().createQueryBuilder('f')
      .leftJoinAndSelect('f.category', 'c')
      .leftJoinAndSelect('f.employee', 'e')
      .orderBy('f.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (status) {
      query.andWhere('f.status = :status', { status });
    }
    if (category_id) {
      query.andWhere('f.category_id = :category_id', { category_id });
    }

    const [list, total] = await query.getManyAndCount();

    const result = list.map((f) => ({
      id: f.id,
      title: f.title,
      status: f.status,
      category_id: f.category_id,
      category_name: f.category?.name || '',
      employee_name: f.employee?.name || '',
      created_at: f.created_at,
    }));

    res.json(success({ list: result, total, page, pageSize }));
  } catch (err) {
    console.error('Feedback admin list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackService.reply', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { feedback_id, content } = req.body;
    if (!feedback_id || !content || content.trim().length === 0) {
      res.status(400).json(error('反馈ID和回复内容不能为空'));
      return;
    }
    const feedback = await feedbackRepo().findOne({ where: { id: feedback_id } });
    if (!feedback) {
      res.status(400).json(error('反馈不存在'));
      return;
    }

    const reply = replyRepo().create({
      feedback_id,
      employee_id: req.user!.id,
      content: content.trim(),
    });
    await replyRepo().save(reply);

    feedback.status = 'replied';
    await feedbackRepo().save(feedback);

    await notificationRepo().save(
      notificationRepo().create({
        employee_id: feedback.employee_id,
        title: '反馈已回复',
        content: `您的反馈"${feedback.title}"已有管理员回复`,
        is_read: 0,
      })
    );

    res.json(success(null));
  } catch (err) {
    console.error('Feedback reply error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
