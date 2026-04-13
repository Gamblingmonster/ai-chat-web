require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

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
