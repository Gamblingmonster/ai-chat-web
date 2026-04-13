import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [
      { id: 1, name: '默认会话', messages: [] }
    ],
    currentSessionId: 1,
    loading: false,
    useWebSearch: false, // 联网搜索开关
    useImageGen: false // 图片生成开关
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
          // 收到内容，停止思考
          if (lastMessage.isThinking) {
            lastMessage.isThinking = false
          }
          lastMessage.content += content
        }
      }
    },
    setThinking(status) {
      const session = this.currentSession
      if (session && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.isThinking = status
        }
      }
    },
    async sendMessage(content) {
      if (!content.trim()) return

      // 添加用户消息
      this.addMessage({ role: 'user', content })
      this.loading = true

      // 添加一个助手消息，初始状态为思考中
      this.addMessage({ role: 'assistant', content: '', isThinking: true })

      try {
        // 如果开启了图片生成
        if (this.useImageGen) {
          const response = await fetch('http://localhost:3000/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: content })
          })
          const data = await response.json()
          if (data.imageUrl) {
            this.updateLastMessage('') // 停止思考
            const session = this.currentSession
            const lastMessage = session.messages[session.messages.length - 1]
            lastMessage.imageUrl = data.imageUrl
            lastMessage.isThinking = false
            this.loading = false
            return
          }
        }

        // 使用 JSON 序列化实现深拷贝，避免修改原消息内容
        let finalMessages = JSON.parse(JSON.stringify(this.messages.slice(0, -1)))

        // 联网搜索逻辑
        if (this.useWebSearch) {
          try {
            const searchRes = await fetch('http://localhost:3000/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: content })
            })
            const searchData = await searchRes.json()
            if (searchData.results && searchData.results.length > 0) {
              const context = searchData.results.map(r => `标题: ${r.title}\n链接: ${r.link}\n摘要: ${r.snippet}`).join('\n\n')
              const searchPrompt = `以下是来自互联网的搜索结果，请结合这些结果回答用户的问题：\n\n${context}\n\n用户的问题是：${content}`
              
              // 替换最后一条用户消息的内容为带背景知识的版本
              finalMessages[finalMessages.length - 1].content = searchPrompt
            }
          } catch (e) {
            console.error('搜索失败，降级为常规对话', e)
          }
        }

        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: finalMessages
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
        this.setThinking(false)
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
