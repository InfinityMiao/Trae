import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { RegulationCategory } from '../entities/RegulationCategory';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();
const categoryRepo = () => AppDataSource.getRepository(RegulationCategory);

function buildTree(categories: RegulationCategory[], parentId: number | null = null): any[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      id: c.id,
      name: c.name,
      parent_id: c.parent_id,
      is_system: c.is_system,
      sort_order: c.sort_order,
      children: buildTree(categories, c.id),
    }));
}

router.post('/regulationCategoryService.tree', requireAuth, async (req, res) => {
  try {
    const categories = await categoryRepo().find({ order: { sort_order: 'ASC' } });
    res.json(success(buildTree(categories)));
  } catch (err) {
    console.error('Category tree error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationCategoryService.create', requireAdmin, async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json(error('分类名称不能为空'));
      return;
    }
    const category = categoryRepo().create({
      name: name.trim(),
      parent_id: parent_id || null,
      is_system: 0,
      sort_order: 0,
    });
    await categoryRepo().save(category);
    res.json(success({ id: category.id }));
  } catch (err) {
    console.error('Category create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationCategoryService.update', requireAdmin, async (req, res) => {
  try {
    const { id, name, parent_id } = req.body;
    if (!id || !name || name.trim().length === 0) {
      res.status(400).json(error('分类ID和名称不能为空'));
      return;
    }
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) {
      res.status(400).json(error('分类不存在'));
      return;
    }
    if (category.is_system === 1) {
      res.status(400).json(error('系统内置分类不允许编辑名称'));
      return;
    }
    category.name = name.trim();
    category.parent_id = parent_id || null;
    await categoryRepo().save(category);
    res.json(success(null));
  } catch (err) {
    console.error('Category update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/regulationCategoryService.delete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('分类ID不能为空'));
      return;
    }
    const category = await categoryRepo().findOne({ where: { id } });
    if (!category) {
      res.status(400).json(error('分类不存在'));
      return;
    }
    if (category.is_system === 1) {
      res.status(400).json(error('系统内置分类不允许删除'));
      return;
    }
    await categoryRepo().delete({ parent_id: id });
    await categoryRepo().delete(id);
    res.json(success(null));
  } catch (err) {
    console.error('Category delete error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
