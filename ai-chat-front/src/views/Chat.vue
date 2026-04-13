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
            <div v-else class="text">{{ msg.content || (loading && index === currentSession.messages.length - 1 ? '...' : '') }}</div>
          </div>
        </div>
      </div>

      <!-- 底部输入框 -->
      <div class="input-area">
        <div class="tools-bar">
          <label class="search-toggle">
            <input type="checkbox" v-model="useWebSearch">
            <span class="toggle-text">🌐 联网搜索</span>
          </label>
        </div>
        <div class="input-wrapper">
          <textarea 
            v-model="inputText" 
            placeholder="输入您的问题..." 
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
const { sessions, currentSessionId, currentSession, loading, useWebSearch } = storeToRefs(chatStore)
const { createNewSession, switchSession, sendMessage } = chatStore

const inputText = ref('')
const chatAreaRef = ref(null)

const handleSend = async () => {
  if (!inputText.value.trim() || loading.value) return
  const text = inputText.value
  inputText.value = ''
  await sendMessage(text)
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
  gap: 15px;
}

.search-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  user-select: none;
}

.search-toggle input {
  margin-right: 6px;
  cursor: pointer;
}

.toggle-text {
  transition: color 0.2s;
}

.search-toggle input:checked + .toggle-text {
  color: #10a37f;
  font-weight: bold;
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
