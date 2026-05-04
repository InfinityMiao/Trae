import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { success, error } from '../utils/response';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const notificationRepo = () => AppDataSource.getRepository(Notification);

router.post('/notificationService.list', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.body;
    const [list, total] = await notificationRepo().findAndCount({
      where: { employee_id: req.user!.id },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.json(success({
      list,
      total,
      page,
      pageSize,
    }));
  } catch (err) {
    console.error('Notification list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/notificationService.unreadCount', requireAuth, async (req: AuthRequest, res) => {
  try {
    const count = await notificationRepo().count({
      where: { employee_id: req.user!.id, is_read: 0 },
    });

    res.json(success({ count }));
  } catch (err) {
    console.error('Notification unread count error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/notificationService.markRead', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('通知ID不能为空'));
      return;
    }

    const notification = await notificationRepo().findOne({
      where: { id, employee_id: req.user!.id },
    });

    if (!notification) {
      res.status(400).json(error('通知不存在'));
      return;
    }

    notification.is_read = 1;
    await notificationRepo().save(notification);

    res.json(success(null));
  } catch (err) {
    console.error('Notification mark read error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/notificationService.markAllRead', requireAuth, async (req: AuthRequest, res) => {
  try {
    await notificationRepo().update(
      { employee_id: req.user!.id, is_read: 0 },
      { is_read: 1 }
    );

    res.json(success(null));
  } catch (err) {
    console.error('Notification mark all read error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
