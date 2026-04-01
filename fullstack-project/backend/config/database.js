const { Sequelize } = require('sequelize');
require('dotenv').config();

// 使用 SQLite 数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

testConnection();

module.exports = sequelize;