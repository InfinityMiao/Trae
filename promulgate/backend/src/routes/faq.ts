import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Faq } from '../entities/Faq';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();
const faqRepo = () => AppDataSource.getRepository(Faq);

router.post('/faqService.list', requireAuth, async (req, res) => {
  try {
    const faqs = await faqRepo().find({ order: { sort_order: 'ASC' } });
    res.json(success(faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, sort_order: f.sort_order }))));
  } catch (err) {
    console.error('FAQ list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/faqService.adminList', requireAdmin, async (req, res) => {
  try {
    const faqs = await faqRepo().find({ order: { sort_order: 'ASC' } });
    res.json(success(faqs));
  } catch (err) {
    console.error('FAQ admin list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/faqService.create', requireAdmin, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      res.status(400).json(error('问题和答案不能为空'));
      return;
    }
    const faq = faqRepo().create({ question: question.trim(), answer: answer.trim(), sort_order: 0 });
    await faqRepo().save(faq);
    res.json(success({ id: faq.id }));
  } catch (err) {
    console.error('FAQ create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/faqService.update', requireAdmin, async (req, res) => {
  try {
    const { id, question, answer } = req.body;
    if (!id || !question || !answer) {
      res.status(400).json(error('ID、问题和答案不能为空'));
      return;
    }
    const faq = await faqRepo().findOne({ where: { id } });
    if (!faq) {
      res.status(400).json(error('FAQ不存在'));
      return;
    }
    faq.question = question.trim();
    faq.answer = answer.trim();
    await faqRepo().save(faq);
    res.json(success(null));
  } catch (err) {
    console.error('FAQ update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/faqService.delete', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json(error('ID不能为空'));
      return;
    }
    await faqRepo().delete(id);
    res.json(success(null));
  } catch (err) {
    console.error('FAQ delete error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/faqService.updateSort', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json(error('参数格式错误'));
      return;
    }
    for (const item of items) {
      await faqRepo().update(item.id, { sort_order: item.sort_order });
    }
    res.json(success(null));
  } catch (err) {
    console.error('FAQ update sort error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
