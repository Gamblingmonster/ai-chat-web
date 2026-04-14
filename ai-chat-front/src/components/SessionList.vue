<template>
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
        <span class="session-name" v-if="editingId !== session.id">{{ session.name }}</span>
        <input 
          v-else 
          v-model="editingName" 
          class="rename-input" 
          @blur="saveRename(session.id)" 
          @keyup.enter="saveRename(session.id)"
          ref="renameInputRef"
        >
        <div class="session-actions">
          <button @click.stop="startRename(session)" class="action-btn" title="重命名">✏️</button>
          <button @click.stop="handleDelete(session.id)" class="action-btn" title="删除">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useChatStore } from '../store/chat'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { sessions, currentSessionId } = storeToRefs(chatStore)
const { createNewSession, switchSession, deleteSession, renameSession } = chatStore

const editingId = ref(null)
const editingName = ref('')
const renameInputRef = ref(null)

const startRename = (session) => {
  editingId.value = session.id
  editingName.value = session.name
  nextTick(() => {
    renameInputRef.value?.[0]?.focus()
  })
}

const saveRename = async (id) => {
  if (editingId.value === id) {
    if (editingName.value.trim() && editingName.value !== sessions.value.find(s => s.id === id)?.name) {
      await renameSession(id, editingName.value)
    }
    editingId.value = null
  }
}

const handleDelete = async (id) => {
  if (confirm('确定要删除这个会话吗？')) {
    await deleteSession(id)
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #202123;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
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
  font-size: 14px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.session-item:hover {
  background-color: #2b2c2f;
}

.session-item.active {
  background-color: #343541;
}

.session-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.rename-input {
  flex: 1;
  background-color: #40414f;
  border: 1px solid #10a37f;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  width: 100%;
  font-size: 14px;
  outline: none;
}

.session-actions {
  display: none;
  gap: 4px;
}

.session-item:hover .session-actions,
.session-item.active .session-actions {
  display: flex;
}

.action-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  font-size: 14px;
}

.action-btn:hover {
  opacity: 1;
}
</style>
