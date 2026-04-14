require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-chat')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// 中间件配置
app.use(cors());
app.use(express.json());

// 静态文件服务 - 用于预览上传的文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        endpoints: ['/api/chat', '/api/search', '/api/image'] 
    });
});

// 使用封装后的路由
app.use('/api', apiRoutes);

// 启动服务器
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
