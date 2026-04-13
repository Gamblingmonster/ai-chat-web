import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [
      { id: 1, name: '默认会话', messages: [] }
    ],
    currentSessionId: 1,
    loading: false
  }),
  getters: {
    currentSession: (state) => state.sessions.find(s => s.id === state.currentSessionId),
    messages: (state) => {
      const session = state.sessions.find(s => s.id === state.currentSessionId)
      return session ? session.messages : []
    }
  },
  actions: {
    addMessage(message) {
      const session = this.currentSession
      if (session) {
        session.messages.push(message)
      }
    },
    updateLastMessage(content) {
      const session = this.currentSession
      if (session && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.content += content
        }
      }
    },
    async sendMessage(content) {
      if (!content.trim()) return

      // 添加用户消息
      this.addMessage({ role: 'user', content })
      this.loading = true

      // 添加一个空的助手消息用于流式接收
      this.addMessage({ role: 'assistant', content: '' })

      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: this.messages.slice(0, -1) // 发送历史消息，不包含最后一个空的助手消息
          })
        })

        if (!response.ok) throw new Error('网络请求失败')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '')
              if (dataStr === '[DONE]') break
              
              try {
                const data = JSON.parse(dataStr)
                if (data.content) {
                  this.updateLastMessage(data.content)
                }
              } catch (e) {
                console.error('解析流数据出错', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('发送消息出错', error)
        this.updateLastMessage('错误: 无法连接到服务器')
      } finally {
        this.loading = false
      }
    },
    createNewSession() {
      const id = Date.now()
      this.sessions.unshift({
        id,
        name: `新会话 ${this.sessions.length + 1}`,
        messages: []
      })
      this.currentSessionId = id
    },
    switchSession(id) {
      this.currentSessionId = id
    }
  }
})
