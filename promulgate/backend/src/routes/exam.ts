import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Exam } from '../entities/Exam';
import { ExamRegulation } from '../entities/ExamRegulation';
import { ExamRecord } from '../entities/ExamRecord';
import { RegulationPermission } from '../entities/RegulationPermission';
import { Notification } from '../entities/Notification';
import { Employee } from '../entities/Employee';
import { success, error } from '../utils/response';
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const examRepo = () => AppDataSource.getRepository(Exam);
const examRegulationRepo = () => AppDataSource.getRepository(ExamRegulation);
const examRecordRepo = () => AppDataSource.getRepository(ExamRecord);
const permissionRepo = () => AppDataSource.getRepository(RegulationPermission);
const notificationRepo = () => AppDataSource.getRepository(Notification);
const employeeRepo = () => AppDataSource.getRepository(Employee);

router.post('/examService.list', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const emp = await employeeRepo().findOne({ where: { id: user.id } });
    const deptId = emp?.department_id;
    const posId = emp?.position_id;

    const examRegs = await examRegulationRepo().find();
    const regulationIds = [...new Set(examRegs.map((er) => er.regulation_id))];

    const perms = await permissionRepo().find({
      where: regulationIds.map((rid) => ({ regulation_id: rid })),
    });

    const allowedRegIds = regulationIds.filter((rid) =>
      perms.some(
        (p) =>
          p.regulation_id === rid &&
          ((p.target_type === 'department' && p.target_id === deptId) ||
            (p.target_type === 'position' && p.target_id === posId))
      )
    );

    const examIds = [
      ...new Set(examRegs.filter((er) => allowedRegIds.includes(er.regulation_id)).map((er) => er.exam_id)),
    ];

    if (examIds.length === 0) {
      res.json(success([]));
      return;
    }

    const exams = await examRepo().find({ where: examIds.map((id) => ({ id })) });
    const published = exams.filter((e) => e.status === 'published');

    const result = await Promise.all(
      published.map(async (exam) => {
        const records = await examRecordRepo().find({
          where: { exam_id: exam.id, employee_id: user.id },
          order: { score: 'DESC' },
        });
        const best = records[0];
        return {
          id: exam.id,
          name: exam.name,
          description: exam.description,
          pass_score: exam.pass_score,
          best_score: best?.score || 0,
          is_passed: best?.is_passed === 1,
        };
      })
    );

    res.json(success(result));
  } catch (err) {
    console.error('Exam list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.adminList', requireAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.body;
    const [exams, total] = await examRepo().findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const examIds = exams.map((e) => e.id);
    const examRegs = examIds.length > 0
      ? await examRegulationRepo().find({ where: examIds.map((id) => ({ exam_id: id })) })
      : [];

    const list = exams.map((exam) => {
      const regulation_ids = examRegs
        .filter((er) => er.exam_id === exam.id)
        .map((er) => er.regulation_id);
      return {
        id: exam.id,
        name: exam.name,
        description: exam.description,
        pass_score: exam.pass_score,
        status: exam.status,
        content: exam.content,
        regulation_ids,
        created_at: exam.created_at,
      };
    });

    res.json(success({ list, total, page, pageSize }));
  } catch (err) {
    console.error('Exam admin list error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.create', requireAdmin, async (req, res) => {
  try {
    const { name, description, pass_score, content, regulation_ids = [] } = req.body;
    if (!name || !pass_score || !content) {
      res.status(400).json(error('考试名称、及格分数线和题目内容不能为空'));
      return;
    }
    const exam = examRepo().create({
      name: name.trim(),
      description: description?.trim() || null,
      pass_score,
      content,
      source: 'manual',
      status: 'closed',
    });
    await examRepo().save(exam);

    const regs = regulation_ids.map((rid: number) =>
      examRegulationRepo().create({ exam_id: exam.id, regulation_id: rid })
    );
    if (regs.length > 0) {
      await examRegulationRepo().save(regs);
    }

    res.json(success({ id: exam.id }));
  } catch (err) {
    console.error('Exam create error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.update', requireAdmin, async (req, res) => {
  try {
    const { id, name, description, pass_score, content, regulation_ids = [] } = req.body;
    if (!id || !name || !pass_score || !content) {
      res.status(400).json(error('考试ID、名称、及格分数线和题目内容不能为空'));
      return;
    }
    const exam = await examRepo().findOne({ where: { id } });
    if (!exam) {
      res.status(400).json(error('考试不存在'));
      return;
    }
    exam.name = name.trim();
    exam.description = description?.trim() || null;
    exam.pass_score = pass_score;
    exam.content = content;
    await examRepo().save(exam);

    await examRegulationRepo().delete({ exam_id: id });
    const regs = regulation_ids.map((rid: number) =>
      examRegulationRepo().create({ exam_id: exam.id, regulation_id: rid })
    );
    if (regs.length > 0) {
      await examRegulationRepo().save(regs);
    }

    res.json(success(null));
  } catch (err) {
    console.error('Exam update error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.updateStatus', requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status || !['published', 'closed'].includes(status)) {
      res.status(400).json(error('考试ID和状态不能为空'));
      return;
    }
    const exam = await examRepo().findOne({ where: { id } });
    if (!exam) {
      res.status(400).json(error('考试不存在'));
      return;
    }
    const wasClosed = exam.status === 'closed';
    exam.status = status;
    await examRepo().save(exam);

    if (wasClosed && status === 'published') {
      const regs = await examRegulationRepo().find({ where: { exam_id: id } });
      const regulationIds = regs.map((r) => r.regulation_id);
      const perms = await permissionRepo().find({
        where: regulationIds.map((rid) => ({ regulation_id: rid })),
      });
      const deptIds = [...new Set(perms.filter((p) => p.target_type === 'department').map((p) => p.target_id))];
      const posIds = [...new Set(perms.filter((p) => p.target_type === 'position').map((p) => p.target_id))];

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
          title: '新考试发布',
          content: `《${exam.name}》已发布，请及时参加`,
          is_read: 0,
        })
      );
      if (notifications.length > 0) {
        await notificationRepo().save(notifications);
      }
    }

    res.json(success(null));
  } catch (err) {
    console.error('Exam update status error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.start', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { exam_id } = req.body;
    if (!exam_id) {
      res.status(400).json(error('考试ID不能为空'));
      return;
    }
    const exam = await examRepo().findOne({ where: { id: exam_id } });
    if (!exam || exam.status !== 'published') {
      res.status(400).json(error('考试不存在或未发布'));
      return;
    }
    const questions = (exam.content?.questions || []).map((q: any) => ({
      type: q.type,
      content: q.content,
      options: q.options,
    }));
    res.json(success({ questions }));
  } catch (err) {
    console.error('Exam start error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { exam_id, answers } = req.body;
    if (!exam_id || !answers) {
      res.status(400).json(error('考试ID和答案不能为空'));
      return;
    }
    const exam = await examRepo().findOne({ where: { id: exam_id } });
    if (!exam) {
      res.status(400).json(error('考试不存在'));
      return;
    }

    const questions = exam.content?.questions || [];
    const totalQuestions = questions.length;
    if (totalQuestions === 0) {
      res.status(400).json(error('考试没有题目'));
      return;
    }

    const scorePerQuestion = Math.floor(100 / totalQuestions);
    let totalScore = 0;
    const details: any[] = [];

    for (let i = 0; i < totalQuestions; i++) {
      const q = questions[i];
      const userAnswer = answers[i];
      let correct = false;

      if (q.type === 'single') {
        correct = userAnswer === q.answer;
      } else if (q.type === 'multiple') {
        const ua = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
        const ca = Array.isArray(q.answer) ? [...q.answer].sort() : [];
        correct = ua.join(',') === ca.join(',');
      } else if (q.type === 'judge') {
        const ua = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
        const ca = Array.isArray(q.answer) ? q.answer[0] : q.answer;
        correct = ua === ca;
      }

      if (correct) {
        totalScore += scorePerQuestion;
      }

      details.push({
        question_index: i,
        question: q.content,
        user_answer: userAnswer,
        correct_answer: q.answer,
        is_correct: correct,
        explanation: q.explanation,
      });
    }

    const isPassed = totalScore >= exam.pass_score;

    const record = examRecordRepo().create({
      employee_id: req.user!.id,
      exam_id,
      score: totalScore,
      is_passed: isPassed ? 1 : 0,
      answers,
    });
    await examRecordRepo().save(record);

    res.json(success({ score: totalScore, is_passed: isPassed, details }));
  } catch (err) {
    console.error('Exam submit error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.records', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.body;
    const [list, total] = await examRecordRepo().findAndCount({
      where: { employee_id: req.user!.id },
      //relations: ['exam'],
      order: { submitted_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const result = await Promise.all(
      list.map(async (record) => {
        const exam = await examRepo().findOne({ where: { id: record.exam_id } });
        return {
          id: record.id,
          exam_id: record.exam_id,
          exam_name: exam?.name || '',
          score: record.score,
          is_passed: record.is_passed === 1,
          submitted_at: record.submitted_at,
        };
      })
    );

    res.json(success({ list: result, total, page, pageSize }));
  } catch (err) {
    console.error('Exam records error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

router.post('/examService.getByRegulation', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { regulation_id } = req.body;
    if (!regulation_id) {
      res.status(400).json(error('制度ID不能为空'));
      return;
    }
    const examRegs = await examRegulationRepo().find({ where: { regulation_id } });
    const examIds = examRegs.map((er) => er.exam_id);
    if (examIds.length === 0) {
      res.json(success([]));
      return;
    }
    const exams = await examRepo().findByIds(examIds);
    const published = exams.filter((e) => e.status === 'published');

    const result = await Promise.all(
      published.map(async (exam) => {
        const records = await examRecordRepo().find({
          where: { exam_id: exam.id, employee_id: req.user!.id },
          order: { score: 'DESC' },
        });
        const best = records[0];
        return {
          id: exam.id,
          name: exam.name,
          pass_score: exam.pass_score,
          best_score: best?.score || 0,
          is_passed: best?.is_passed === 1,
          status: exam.status,
        };
      })
    );

    res.json(success(result));
  } catch (err) {
    console.error('Exam get by regulation error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
