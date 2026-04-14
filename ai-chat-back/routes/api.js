const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const apiController = require('../controllers/apiController');

// 配置 Multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 定义 API 路由
router.post('/chat', apiController.chat);
router.post('/search', apiController.search);
router.post('/image', apiController.generateImage);
router.post('/upload', upload.single('file'), apiController.uploadFile);

module.exports = router;
