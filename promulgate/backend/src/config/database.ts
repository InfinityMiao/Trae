import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_DATABASE || 'institution_learning',
  synchronize: process.env.NODE_ENV === 'development',
  //logging: process.env.NODE_ENV === 'development',
  logging: ['error', 'warn'],
  entities: [__dirname + '/../entities/**/*.{ts,js}'],
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
  subscribers: [],
});
