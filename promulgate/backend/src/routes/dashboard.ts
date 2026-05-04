import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';
import { Regulation } from '../entities/Regulation';
import { Exam } from '../entities/Exam';
import { Feedback } from '../entities/Feedback';
import { success, error } from '../utils/response';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const employeeRepo = () => AppDataSource.getRepository(Employee);
const regulationRepo = () => AppDataSource.getRepository(Regulation);
const examRepo = () => AppDataSource.getRepository(Exam);
const feedbackRepo = () => AppDataSource.getRepository(Feedback);

router.post('/dashboardService.getStats', requireAdmin, async (req, res) => {
  try {
    const totalEmployees = await employeeRepo().count();
    const totalRegulations = await regulationRepo().count();
    const totalExams = await examRepo().count();
    const pendingFeedbacks = await feedbackRepo().count({ where: { status: 'pending' } });

    res.json(success({
      total_employees: totalEmployees,
      total_regulations: totalRegulations,
      total_exams: totalExams,
      pending_feedbacks: pendingFeedbacks,
    }));
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json(error('服务器内部错误', 500));
  }
});

export default router;
