const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/info', (req, res) => {
    res.json({
        message: '欢迎来到我的网站',
        time: new Date().toLocaleString('zh-CN')
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器正在运行: http://0.0.0.0:${PORT}`);
    console.log(`可以从其他主机访问本网站`);
});
