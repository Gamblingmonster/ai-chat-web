# AI Chat Web - 豆沙包智能对话系统

这是一个基于 **Vue 3 + Node.js (Express)** 开发的全栈 AI 聊天应用。项目支持流式（Streaming）响应，对接了阿里通义千问（DashScope）大模型，实现了流畅的打字机对话效果。

## 🌟 项目特性

- **流式对话**：基于 SSE (Server-Sent Events) 技术，实现与大模型的实时流式交互。
- **多会话管理**：支持创建、切换和管理多个聊天会话。
- **响应式 UI**：现代化的聊天界面，包含左侧会话历史、右侧对话区域及底部输入框。
- **状态管理**：使用 Pinia 高效管理应用状态和消息列表。
- **环境隔离**：使用 `.env` 保护 API Key 等敏感信息。

## 🛠️ 技术栈

### 前端 (ai-chat-front)
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **网络请求**: Fetch API (用于流式数据读取)

### 后端 (ai-chat-back)
- **环境**: Node.js
- **框架**: Express
- **AI SDK**: OpenAI Node.js SDK (适配 DashScope 兼容模式)
- **实时通信**: SSE (Server-Sent Events)

## 📂 项目结构

```text
ai-chat-web/
├── ai-chat-back/        # 后端项目 (Express)
│   ├── server.js        # 后端核心逻辑
│   ├── .env             # 环境变量 (API Key)
│   └── package.json
├── ai-chat-front/       # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── store/       # Pinia 状态管理
│   │   ├── views/       # 页面组件 (Chat.vue)
│   │   └── router/      # 路由配置
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/ai-chat-web.git
cd ai-chat-web
```

### 2. 后端配置与启动
进入后端目录：
```bash
cd ai-chat-back
npm install
```
在 `ai-chat-back` 目录下创建 `.env` 文件并填入您的 API Key：
```env
DASHSCOPE_API_KEY=您的通义千问API_KEY
PORT=3000
```
启动后端服务：
```bash
npm start
```

### 3. 前端配置与启动
进入前端目录：
```bash
cd ../ai-chat-front
npm install
```
启动前端开发服务器：
```bash
npm run dev
```

访问浏览器：`http://localhost:5173/chat` 即可开始体验！

## 📝 提交记录
- **Day 1**: 完成前后端骨架搭建，实现 SSE 流式接口及前端打字机效果，完成多会话逻辑。

## 📄 开源协议
[MIT License](LICENSE)
