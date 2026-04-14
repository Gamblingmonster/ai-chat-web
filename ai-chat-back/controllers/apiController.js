const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');

// 通义千问兼容模式
const client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// Serper 搜索 API
const SERPER_API_KEY = process.env.SERPER_API_KEY;

/**
 * 聊天接口 (流式响应)
 */
exports.chat = async (req, res) => {
    const { messages, file_id } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 构造请求参数
        const completionParams = {
            model: 'qwen-max',
            messages: messages,
            stream: true,
        };

        // 如果有文件 ID，将其添加到最后一条用户消息中（千问兼容模式支持此方式或在 messages 数组中加入文件引用）
        // 注：对于兼容模式，通常是将 file_id 放入消息内容中或使用特定的 system prompt 告知
        if (file_id) {
            const lastMsg = messages[messages.length - 1];
            // 在内容开头告知 AI 有附件
            lastMsg.content = `[附件文件 ID: ${file_id}]\n${lastMsg.content}`;
        }

        const stream = await client.chat.completions.create(completionParams);

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Chat failed' });
        } else {
            res.end();
        }
    }
};

/**
 * 搜索接口
 */
exports.search = async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = await axios.post('https://google.serper.dev/search', {
            q: query,
            gl: 'cn',
            hl: 'zh-cn'
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const results = response.data.organic.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        })).slice(0, 5);

        res.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

/**
 * 图片生成接口
 */
exports.generateImage = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const encodedPrompt = encodeURIComponent(prompt);
        // 使用更兼容的 image. 子域名，并加入 turbo 模型提升速度
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&model=turbo&nologo=true&safe=true`;
        
        res.json({ imageUrl });
    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({ error: 'Image generation failed' });
    }
};

/**
 * 文件上传接口 (本地 + 通义千问服务)
 */
exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    let qwenFileId = null;

    try {
        // 1. 上传到通义千问文件服务 (OpenAI 兼容接口)
        // 只有特定的文档类型支持解析，这里尝试上传
        try {
            const fileStream = fs.createReadStream(req.file.path);
            const qwenFile = await client.files.create({
                file: fileStream,
                purpose: 'file-extract', // 千问解析用途
            });
            qwenFileId = qwenFile.id;
            console.log('Qwen file uploaded:', qwenFileId);
        } catch (fileError) {
            console.warn('Qwen file upload failed (might not support this format):', fileError.message);
            // 即使上传千问失败，也允许继续使用本地预览
        }

        const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        res.json({
            message: 'File uploaded successfully',
            file: {
                name: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                url: fileUrl,
                qwen_file_id: qwenFileId, // 返回给前端的千问 ID
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
};

