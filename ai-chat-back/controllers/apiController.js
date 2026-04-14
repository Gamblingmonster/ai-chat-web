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
    const { messages } = req.body;

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
 * 文件上传接口 (本地 + 内容解析)
 */
exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    let parsedContent = null;

    try {
        // 1. 如果是文本类型文件，尝试直接读取内容
        const isText = req.file.mimetype.startsWith('text/') || 
                       req.file.originalname.match(/\.(txt|md|json|js|vue|html|css|py|c|cpp|h|ts)$/) ||
                       req.file.originalname.endsWith('.txt');

        if (isText) {
            try {
                parsedContent = fs.readFileSync(req.file.path, 'utf-8');
                console.log('File content parsed successfully');
            } catch (readError) {
                console.warn('Failed to read file content:', readError.message);
            }
        }

        const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        res.json({
            message: 'File uploaded and parsed successfully',
            file: {
                name: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                url: fileUrl,
                parsed_content: parsedContent, // 将解析出的内容返回给前端
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
};

