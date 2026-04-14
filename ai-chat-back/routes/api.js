const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const apiController = require('../controllers/apiController');
const sessionController = require('../controllers/sessionController');

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

// 会话管理
router.get('/sessions', sessionController.getSessions);
router.post('/sessions', sessionController.createSession);
router.get('/sessions/:id/messages', sessionController.getSessionMessages);
router.put('/sessions/:id', sessionController.renameSession);
router.delete('/sessions/:id', sessionController.deleteSession);

// 核心功能
router.post('/chat', apiController.chat);
router.post('/search', apiController.search);
router.post('/image', apiController.generateImage);
router.post('/upload', upload.single('file'), apiController.uploadFile);

module.exports = router;
