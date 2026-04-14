# AI Chat Web - 豆沙包智能对话系统

这是一个基于 **Vue 3 + Node.js (Express)** 开发的全栈 AI 聊天应用。项目支持流式（Streaming）响应，对接了阿里通义千问（DashScope）大模型，实现了流畅的打字机对话效果，并集成了联网搜索、图片生成等高级功能。

## 🌟 项目特性

- **流式对话**：基于 SSE (Server-Sent Events) 技术，实现与大模型的实时流式交互。
- **思考模式 (Thinking)**：在 AI 正式回答前提供生动的“思考中...”动画，提升用户体验。
- **联网搜索**：集成 Serper.dev 接口，支持实时获取互联网信息并注入 AI 上下文进行回答。
- **AI 图片生成**：集成 Pollinations.ai (Flux 模型)，支持根据文本描述生成高质量图片。
- **多会话管理**：支持创建、切换和管理多个聊天会话，支持 UI 交互式工具切换。
- **响应式 UI**：现代化的聊天界面，包含左侧会话历史、右侧对话区域及底部输入框。
- **状态管理**：使用 Pinia 高效管理应用状态、消息列表及功能开关。
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
- **数据库**: MongoDB (Mongoose) - 用于会话与消息持久化
- **AI SDK**: OpenAI Node.js SDK (适配 DashScope 兼容模式)
- **网络请求**: Axios (用于搜索 API 调用)
- **实时通信**: SSE (Server-Sent Events)

## 📂 项目结构

```text
ai-chat-web/
├── ai-chat-back/        # 后端项目 (Express)
│   ├── server.js        # 后端核心逻辑 (API 路由、流式代理)
│   ├── .env             # 环境变量 (API Key 配置)
│   └── package.json
├── ai-chat-front/       # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── store/       # Pinia 状态管理 (会话逻辑)
│   │   ├── views/       # 页面组件 (Chat.vue)
│   │   └── router/      # 路由配置
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Gamblingmonster/ai-chat-web.git
cd ai-chat-web
```

### 2. 数据库准备 (MongoDB)

在启动后端服务之前，必须确保 **MongoDB 服务** 已在运行：

- **本地启动**：打开一个新的终端窗口，输入以下命令启动数据库：
  ```bash
  mongod
  ```
  *(请确保数据库窗口在运行期间保持开启状态)*

### 3. 后端配置与启动

进入后端目录：

```bash
cd ai-chat-back
npm install
```

在 `ai-chat-back` 目录下创建 `.env` 文件并填入您的 API Key：

```env
# 通义千问 API Key
DASHSCOPE_API_KEY=您的通义千问API_KEY
# Serper.dev API Key (用于联网搜索)
SERPER_API_KEY=您的SERPER_API_KEY
# MongoDB 连接串 (默认本地)
MONGODB_URI=mongodb://localhost:27017/ai_chat
PORT=3000
```

启动后端服务：

```bash
npm start
```

### 4. 前端配置与启动

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
- **Day 2**: 实现 AI 思考状态动画，集成 Serper.dev 联网搜索功能。
- **Day 3**: 集成 Pollinations.ai 图片生成功能 (Flux 模型)，优化 UI 交互逻辑 (功能互斥切换、按钮式开关)，修复全局布局溢出与对齐问题。
- **Day 4**: 实现基于 Web Speech API 的语音转文字 (STT) 功能，实现基于 SpeechSynthesis 的文字转语音 (TTS) 功能，添加语音交互 UI (麦克风录音动画、小喇叭播报动画)。
- **Day 5**: 实现文件上传功能 (图片 / 文档)，后端集成 Multer 处理文件存储，并提供静态访问预览。前端实现文件选择、实时预览、上传进度管理及消息附件展示。优化 AI Prompt，支持文件上下文感知回答。
- **Day 6**: 集成 MongoDB 数据库，实现会话 (Session) 与消息 (Message) 的持久化存储。
- **Day 7**: 完成前端与数据库接口的全面对接，支持历史记录的加载、重命名与删除。

## 📄 开源协议

[MIT License](LICENSE)
