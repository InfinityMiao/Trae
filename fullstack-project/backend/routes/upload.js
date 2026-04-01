const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');

// 上传文件
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '未上传文件' });
    }
    res.status(200).json({ message: '文件上传成功', file: req.file });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;