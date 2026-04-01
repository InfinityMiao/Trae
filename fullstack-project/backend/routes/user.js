const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 注册用户
router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password, phone, department_id, position_id } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }
    
    // 创建新用户
    const user = await User.create({ 
      username, 
      name, 
      email, 
      password, 
      phone, 
      department_id, 
      position_id 
    });
    
    // 生成 JWT 令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ message: '注册成功', token, user });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 登录用户
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 检查用户是否存在
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(400).json({ message: '用户账号已被禁用' });
    }
    
    // 检查密码是否正确
    if (!user.validatePassword(password)) {
      return res.status(400).json({ message: '密码错误' });
    }
    
    // 生成 JWT 令牌
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({ message: '登录成功', token, user });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户信息
router.get('/me', require('../middlewares/auth'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: require('../models/Department'), as: 'Department' },
        { model: require('../models/Position'), as: 'Position' }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;