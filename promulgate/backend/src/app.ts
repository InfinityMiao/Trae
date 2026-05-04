import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { success } from './utils/response';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notification';
import departmentRoutes from './routes/department';
import positionRoutes from './routes/position';
import employeeRoutes from './routes/employee';
import employeeImportRoutes from './routes/employeeImport';
import announcementRoutes from './routes/announcement';
import regulationCategoryRoutes from './routes/regulationCategory';
import regulationRoutes from './routes/regulation';
import examRoutes from './routes/exam';
import feedbackCategoryRoutes from './routes/feedbackCategory';
import feedbackRoutes from './routes/feedback';
import faqRoutes from './routes/faq';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json(success({ status: 'ok', time: new Date().toISOString() }));
});

app.use('/api', authRoutes);
app.use('/api', notificationRoutes);
app.use('/api', departmentRoutes);
app.use('/api', positionRoutes);
app.use('/api', employeeRoutes);
app.use('/api', employeeImportRoutes);
app.use('/api', announcementRoutes);
app.use('/api', regulationCategoryRoutes);
app.use('/api', regulationRoutes);
app.use('/api', examRoutes);
app.use('/api', feedbackCategoryRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', faqRoutes);
app.use('/api', dashboardRoutes);

export default app;
