import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import app from './app';
import { initializeSystemData } from './utils/initData';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    await initializeSystemData();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
