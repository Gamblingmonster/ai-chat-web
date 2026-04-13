const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// 定义 API 路由
router.post('/chat', apiController.chat);
router.post('/search', apiController.search);
router.post('/image', apiController.generateImage);

module.exports = router;
