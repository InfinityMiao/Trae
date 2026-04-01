const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
// 导入所有模型
const models = require('./models');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 路由
app.use('/api/users', require('./routes/user'));
app.use('/api/upload', require('./routes/upload'));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ message: '服务器运行正常' });
});

// 同步数据库
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

syncDatabase();

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

module.exports = app;