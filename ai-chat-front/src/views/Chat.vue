<template>
  <div class="chat-container">
    <!-- 左侧会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <button @click="createNewSession" class="new-chat-btn">+ 新建会话</button>
      </div>
      <div class="session-list">
        <div 
          v-for="session in sessions" 
          :key="session.id" 
          :class="['session-item', { active: session.id === currentSessionId }]"
          @click="switchSession(session.id)"
        >
          <span class="session-name">{{ session.name }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区 -->
    <div class="main-content">
      <div class="chat-header">
        <h2>{{ currentSession?.name }}</h2>
      </div>

      <div class="chat-area" ref="chatAreaRef">
        <div v-for="(msg, index) in currentSession?.messages" :key="index" :class="['message', msg.role]">
          <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
          <div class="message-content">
            <div class="role-name">{{ msg.role === 'user' ? '你' : '豆沙包' }}</div>
            <div v-if="msg.isThinking" class="thinking-container">
              <span class="thinking-text">思考中</span>
              <span class="dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
            <div v-else class="text">
              <!-- 用户消息中包含附件文件 -->
              <template v-if="msg.file">
                <div class="file-attachment">
                  <div v-if="msg.file.mimetype.startsWith('image/')" class="image-preview">
                    <img :src="msg.file.url" alt="Attachment" @load="scrollToBottom" referrerpolicy="no-referrer">
                  </div>
                  <div v-else class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ msg.file.name }}</span>
                    <a :href="msg.file.url" target="_blank" class="download-link">下载</a>
                  </div>
                </div>
              </template>

              <template v-if="msg.imageUrl">
                <div class="image-card">
                  <img 
                    :src="msg.imageUrl" 
                    alt="AI Generated Image" 
                    @load="scrollToBottom" 
                    @error="handleImageError($event, index)"
                    referrerpolicy="no-referrer"
                  >
                  <div class="image-actions">
                    <a :href="msg.imageUrl" target="_blank" class="download-link" referrerpolicy="no-referrer">查看原图</a>
                  </div>
                </div>
              </template>
              <template v-else>
                {{ msg.content || (loading && index === currentSession.messages.length - 1 ? '...' : '') }}
              </template>
              
              <!-- 语音播报按钮 (仅限助手消息) -->
              <div v-if="msg.role === 'assistant' && msg.content" class="msg-tools">
                <button 
                  @click="toggleSpeak(msg.content, index)" 
                  :class="['speak-btn', { 'is-speaking': speakingMsgIndex === index }]"
                  title="语音播报"
                >
                  <span v-if="speakingMsgIndex === index" class="speaking-icon">🔊</span>
                  <span v-else class="speaker-icon">🔈</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入框 -->
      <div class="input-area">
        <!-- 文件预览区 -->
        <div v-if="attachedFile" class="file-preview-bar">
          <div class="preview-item">
            <span v-if="attachedFile.type.startsWith('image/')" class="preview-thumb">🖼️</span>
            <span v-else class="preview-thumb">📄</span>
            <span class="preview-name">{{ attachedFile.name }}</span>
            <button @click="removeFile" class="remove-file-btn">×</button>
          </div>
        </div>

        <div class="tools-bar">
          <button 
            :class="['tool-btn', { active: useWebSearch, disabled: useImageGen }]" 
            :disabled="useImageGen"
            @click="toggleWebSearch"
          >
            🌐 联网搜索
          </button>
          <button 
            :class="['tool-btn', { active: useImageGen }]" 
            @click="toggleImageGen"
          >
            🎨 生成图片
          </button>
          <!-- 文件选择按钮 -->
          <button 
            :class="['tool-btn', { disabled: loading || useImageGen }]" 
            @click="triggerFileInput" 
            :disabled="loading || useImageGen"
          >
            📁 上传文件
          </button>
          <input 
            type="file" 
            ref="fileInputRef" 
            style="display: none" 
            @change="handleFileChange"
          >
        </div>
        <div class="input-wrapper">
          <!-- 语音录入按钮 -->
          <button 
            @click="toggleRecording" 
            :class="['mic-btn', { 'is-recording': isRecording }]"
            title="语音输入"
          >
            <span v-if="isRecording" class="recording-icon">🎤</span>
            <span v-else>🎙️</span>
          </button>
          <textarea 
            v-model="inputText" 
            :placeholder="isRecording ? '正在录音...' : '输入您的问题...'" 
            @keydown.enter.prevent="handleSend"
            :disabled="loading"
          ></textarea>
          <button @click="handleSend" :disabled="loading || !inputText.trim()" class="send-btn">
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '../store/chat'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { sessions, currentSessionId, currentSession, loading, useWebSearch, useImageGen, attachedFile } = storeToRefs(chatStore)
const { createNewSession, switchSession, sendMessage } = chatStore

const inputText = ref('')
const chatAreaRef = ref(null)
const fileInputRef = ref(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    attachedFile.value = file
  }
  // 重置 input 以便同一个文件可以再次选择
  e.target.value = ''
}

const removeFile = () => {
  attachedFile.value = null
}

const toggleWebSearch = () => {
  if (useImageGen.value) return
  useWebSearch.value = !useWebSearch.value
}

const toggleImageGen = () => {
  useImageGen.value = !useImageGen.value
  // 开启生成图片时，自动关闭联网搜索
  if (useImageGen.value) {
    useWebSearch.value = false
  }
}

// --- 语音交互逻辑 ---

// 1. 语音转文字 (STT)
const isRecording = ref(false)
let recognition = null

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event) => {
    let interimTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        inputText.value += event.results[i][0].transcript
      } else {
        interimTranscript += event.results[i][0].transcript
      }
    }
  }

  recognition.onend = () => {
    isRecording.value = false
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isRecording.value = false
  }
}

const toggleRecording = () => {
  if (!recognition) {
    alert('您的浏览器不支持语音输入功能')
    return
  }

  if (isRecording.value) {
    recognition.stop()
  } else {
    isRecording.value = true
    recognition.start()
  }
}

// 2. 文字转语音 (TTS)
const speakingMsgIndex = ref(null)
const synth = window.speechSynthesis
let utterance = null

const toggleSpeak = (text, index) => {
  if (speakingMsgIndex.value === index) {
    // 如果正在播报当前消息，则停止
    synth.cancel()
    speakingMsgIndex.value = null
    return
  }

  // 停止之前的播报
  synth.cancel()

  // 开始新的播报
  utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 1.0
  utterance.pitch = 1.0

  utterance.onend = () => {
    speakingMsgIndex.value = null
  }

  speakingMsgIndex.value = index
  synth.speak(utterance)
}

const handleSend = async () => {
  if ((!inputText.value.trim() && !attachedFile.value) || loading.value) return
  const text = inputText.value
  inputText.value = ''
  await sendMessage(text)
}

// 图片加载失败处理
const handleImageError = (event, index) => {
  console.error('图片加载失败:', event)
  // 如果加载失败，可以尝试重新加载或给个提示
  const msg = currentSession.value.messages[index]
  if (msg && msg.imageUrl) {
    // 可以在这里做重试逻辑，或者直接提示用户
    // msg.content = '图片生成成功，但加载失败了，请点击“查看原图”直接打开。'
  }
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
    }
  })
}

// 监听消息列表变化，自动滚动
watch(() => currentSession.value?.messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background-color: #202123;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
}

.new-chat-btn {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  border: 1px solid #4d4d4f;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-chat-btn:hover {
  background-color: #2b2c2f;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.session-item {
  padding: 12px;
  margin-bottom: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item:hover {
  background-color: #2b2c2f;
}

.session-item.active {
  background-color: #343541;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 15px;
}

.message-content {
  max-width: 80%;
  text-align: left; /* 显式设置左对齐，防止继承 App.vue 的居中 */
}

.user .message-content {
  text-align: right;
}

.role-name {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.text {
  padding: 12px 16px;
  background-color: #f7f7f8;
  border-radius: 8px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.user .text {
  background-color: #10a37f;
  color: white;
}

/* 文件附件样式 */
.file-attachment {
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.user .file-attachment {
  background-color: rgba(255, 255, 255, 0.1);
}

.file-attachment .image-preview img {
  max-width: 100%;
  max-height: 300px;
  display: block;
}

.file-info {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 底部文件预览条 */
.file-preview-bar {
  max-width: 800px;
  margin: 0 auto 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 5px 10px;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.preview-thumb {
  font-size: 18px;
}

.preview-name {
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

/* 消息工具栏 (语音播报) */
.msg-tools {
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
}

.speak-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speak-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.speak-btn.is-speaking .speaking-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

/* 图片卡片样式 */
.image-card {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-card img {
  width: 100%;
  height: auto;
  display: block;
}

.image-actions {
  padding: 8px;
  border-top: 1px solid #eee;
  text-align: right;
}

.download-link {
  font-size: 12px;
  color: #10a37f;
  text-decoration: none;
}

.download-link:hover {
  text-decoration: underline;
}

/* 思考中动画 */
.thinking-container {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f7f8;
  border-radius: 8px;
  color: #666;
  font-size: 16px;
}

.thinking-text {
  margin-right: 4px;
}
.dots {
  display: inline-flex; /* 让点排列更整齐 */
  gap: 2px;
}

.dots span {
  font-size: 24px;     /* 👈 三个点变大！ */
  line-height: 1;      /* 👈 保证垂直居中 */
  animation: blink 1.4s infinite both;
  font-weight: bold;
}

.dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* 输入框区域 */
.input-area {
  padding: 10px 20px 20px;
  border-top: 1px solid #eee;
}

.tools-bar {
  max-width: 800px;
  margin: 0 auto 10px;
  display: flex;
  gap: 10px;
}

.tool-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.tool-btn:hover:not(:disabled) {
  background-color: #e5e5e5;
}

.tool-btn.active {
  background-color: #343541; /* 深色背景 */
  color: #10a37f;           /* 亮色字体 */
  border-color: #343541;
  font-weight: bold;
}

.tool-btn.disabled, .tool-btn:disabled {
  background-color: #f9f9f9;
  color: #ccc;
  border-color: #eee;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: flex-end;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 10px;
}

/* 语音输入按钮 */
.mic-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  font-size: 20px;
  border-radius: 50%;
  transition: all 0.2s;
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-btn:hover {
  background-color: #f0f0f0;
}

.mic-btn.is-recording {
  background-color: #fee2e2;
  color: #ef4444;
  animation: recording-pulse 1.5s infinite;
}

@keyframes recording-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 10px;
  max-height: 200px;
  font-family: inherit;
  font-size: 16px;
}

.send-btn {
  padding: 8px 15px;
  background-color: #10a37f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  transition: opacity 0.2s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
