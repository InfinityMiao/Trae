import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { FeedbackCategory } from '../entities/FeedbackCategory';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();
const categoryRepo = () => AppDataSource.getRepository(FeedbackCategory);

router.post('/feedbackCategoryService.list', requireAuth, async (req, res) => {
  try {
    const categories = await categoryRepo().find({ order: { created_at: 'ASC' } });
    res.json(success(categories.map((c) => ({ id: c.id, name: c.name }))));
  } catch (err) {
    console.error('Feedback category list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackCategoryService.create', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json(error('分类名称不能为空'));
      return;
    }
    const category = categoryRepo().create({ name: name.trim() });
    await categoryRepo().save(category);
    res.json(success({ id: category.id }));
  } catch (err) {
    console.error('Feedback category create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackCategoryService.update', requireAdmin, async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name || name.trim().length === 0) {
      res.status(400).json(error('分类ID和名称不能为空'));
      return;
    }
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) {
      res.status(400).json(error('分类不存在'));
      return;
    }
    category.name = name.trim();
    await categoryRepo().save(category);
    res.json(success(null));
  } catch (err) {
    console.error('Feedback category update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/feedbackCategoryService.delete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('分类ID不能为空'));
      return;
    }
    await categoryRepo().delete(id);
    res.json(success(null));
  } catch (err) {
    console.error('Feedback category delete error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
