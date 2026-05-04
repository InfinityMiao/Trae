import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Announcement } from '../entities/Announcement';
import { Notification } from '../entities/Notification';
import { Employee } from '../entities/Employee';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();
const announcementRepo = () => AppDataSource.getRepository(Announcement);
const notificationRepo = () => AppDataSource.getRepository(Notification);
const employeeRepo = () => AppDataSource.getRepository(Employee);

router.post('/announcementService.list', requireAuth, async (req, res) => {
  try {
    const announcements = await announcementRepo().find({
      where: { status: 'online' },
      order: { sort_order: 'ASC' },
    });
    res.json(success(announcements.map((a) => ({
      id: a.id,
      content: a.content,
      sort_order: a.sort_order,
    }))));
  } catch (err) {
    console.error('Announcement list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/announcementService.adminList', requireAdmin, async (req, res) => {
  try {
    const announcements = await announcementRepo().find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
    res.json(success(announcements.map((a) => ({
      id: a.id,
      content: a.content,
      status: a.status,
      sort_order: a.sort_order,
      created_at: a.created_at,
    }))));
  } catch (err) {
    console.error('Announcement admin list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/announcementService.create', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      res.status(400).json(error('公告内容不能为空'));
      return;
    }
    const announcement = announcementRepo().create({ content: content.trim(), status: 'offline', sort_order: 0 });
    await announcementRepo().save(announcement);
    res.json(success({ id: announcement.id }));
  } catch (err) {
    console.error('Announcement create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/announcementService.update', requireAdmin, async (req, res) => {
  try {
    const { id, content } = req.body;
    if (!id || !content || content.trim().length === 0) {
      res.status(400).json(error('公告ID和内容不能为空'));
      return;
    }
    const announcement = await announcementRepo().findOne({ where: { id } });
    if (!announcement) {
      res.status(400).json(error('公告不存在'));
      return;
    }
    announcement.content = content.trim();
    await announcementRepo().save(announcement);
    res.json(success(null));
  } catch (err) {
    console.error('Announcement update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/announcementService.updateStatus', requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status || !['online', 'offline'].includes(status)) {
      res.status(400).json(error('公告ID和状态不能为空'));
      return;
    }
    const announcement = await announcementRepo().findOne({ where: { id } });
    if (!announcement) {
      res.status(400).json(error('公告不存在'));
      return;
    }
    const wasOffline = announcement.status === 'offline';
    announcement.status = status;
    await announcementRepo().save(announcement);

    if (wasOffline && status === 'online') {
      const employees = await employeeRepo().find({ where: { employee_type: 'employee' } });
      const notifications = employees.map((e) =>
        notificationRepo().create({
          employee_id: e.id,
          title: '新公告',
          content: announcement.content,
          is_read: 0,
        })
      );
      if (notifications.length > 0) {
        await notificationRepo().save(notifications);
      }
    }

    res.json(success(null));
  } catch (err) {
    console.error('Announcement update status error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/announcementService.updateSort', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json(error('参数格式错误'));
      return;
    }
    for (const item of items) {
      await announcementRepo().update(item.id, { sort_order: item.sort_order });
    }
    res.json(success(null));
  } catch (err) {
    console.error('Announcement update sort error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
