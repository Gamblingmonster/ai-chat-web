import { defineStore } from 'pinia'
import { chatApi } from '../api/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [],
    currentSessionId: null,
    loading: false,
    useWebSearch: false, // 联网搜索开关
    useImageGen: false, // 图片生成开关
    attachedFile: null // 当前待发送的文件
  }),
  getters: {
    currentSession: (state) => state.sessions.find(s => s.id === state.currentSessionId || s._id === state.currentSessionId),
    messages: (state) => {
      const session = state.sessions.find(s => s.id === state.currentSessionId || s._id === state.currentSessionId)
      return session ? session.messages : []
    }
  },
  actions: {
    // 初始化，从后端获取会话列表
    async init() {
      try {
        const sessions = await chatApi.getSessions()
        this.sessions = sessions.map(s => ({
          ...s,
          id: s._id, // 兼容前端使用的 id
          messages: []
        }))
        if (this.sessions.length > 0) {
          await this.switchSession(this.sessions[0].id)
        } else {
          await this.createNewSession()
        }
      } catch (error) {
        console.error('初始化会话失败', error)
      }
    },
    addMessage(message) {
      const session = this.currentSession
      if (session) {
        if (!session.messages) session.messages = []
        session.messages.push(message)
      }
    },
    updateLastMessage(content) {
      const session = this.currentSession
      if (session && session.messages && session.messages.length > 0) {
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
      if (session && session.messages && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.isThinking = status
        }
      }
    },
    async sendMessage(content) {
      if (!content.trim() && !this.attachedFile) return

      let uploadedFileData = null;
      const fileToUpload = this.attachedFile;
      this.attachedFile = null; // 清空待上传文件状态

      // 如果有文件，先上传
      if (fileToUpload) {
        try {
          const uploadRes = await chatApi.uploadFile(fileToUpload);
          uploadedFileData = uploadRes.file;
        } catch (error) {
          console.error('文件上传失败', error);
        }
      }

      // 添加用户消息，包含文件信息
      this.addMessage({ 
        role: 'user', 
        content,
        file: uploadedFileData 
      })
      this.loading = true

      // 添加一个助手消息，初始状态为思考中
      this.addMessage({ role: 'assistant', content: '', isThinking: true })

      try {
        // 1. 如果开启了图片生成
        if (this.useImageGen) {
          const data = await chatApi.generateImage(content)
          if (data.imageUrl) {
            this.updateLastMessage('') // 停止思考
            const session = this.currentSession
            const lastMessage = session.messages[session.messages.length - 1]
            lastMessage.imageUrl = data.imageUrl
            lastMessage.isThinking = false
            this.loading = false
            // TODO: 这里图片生成的消息也需要持久化，目前后端 chat 接口只处理了文字
            return
          }
        }

        // 使用 JSON 序列化实现深拷贝，避免修改原消息内容
        let finalMessages = JSON.parse(JSON.stringify(this.messages.slice(0, -1)))
        let lastUserMessage = finalMessages[finalMessages.length - 1]

        // 如果有文件解析出的内容，将其合并到当前发送的消息中
        if (uploadedFileData?.parsed_content) {
          const fileContext = `以下是上传文件 "${uploadedFileData.name}" 的内容：\n\n${uploadedFileData.parsed_content}\n\n请结合以上文件内容回答用户的问题。`
          lastUserMessage.content = `${fileContext}\n\n用户的问题是：${content}`
        }

        // 2. 联网搜索逻辑
        if (this.useWebSearch) {
          try {
            const searchData = await chatApi.search(content)
            if (searchData.results && searchData.results.length > 0) {
              const context = searchData.results.map(r => `标题: ${r.title}\n链接: ${r.link}\n摘要: ${r.snippet}`).join('\n\n')
              const searchPrompt = `以下是来自互联网的搜索结果，请结合这些结果回答用户的问题：\n\n${context}\n\n用户的问题是：${content}`
              
              // 替换最后一条用户消息的内容为带背景知识的版本
              lastUserMessage.content = searchPrompt
            }
          } catch (e) {
            console.error('搜索失败，降级为常规对话', e)
          }
        }

        // 3. 发送聊天请求 (流式)
        const response = await chatApi.sendMessageStream(finalMessages, this.currentSessionId)

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
    async createNewSession() {
      try {
        const session = await chatApi.createSession(`新会话 ${this.sessions.length + 1}`)
        const newSession = {
          ...session,
          id: session._id,
          messages: []
        }
        this.sessions.unshift(newSession)
        this.currentSessionId = newSession.id
      } catch (error) {
        console.error('创建会话失败', error)
      }
    },
    async switchSession(id) {
      this.currentSessionId = id
      const session = this.currentSession
      // 如果该会话的消息还没加载过，则从后端加载
      if (session && (!session.messages || session.messages.length === 0)) {
        try {
          const messages = await chatApi.getSessionMessages(id)
          session.messages = messages
        } catch (error) {
          console.error('加载消息失败', error)
        }
      }
    },
    async deleteSession(id) {
      try {
        await chatApi.deleteSession(id)
        this.sessions = this.sessions.filter(s => s.id !== id)
        if (this.currentSessionId === id) {
          if (this.sessions.length > 0) {
            this.switchSession(this.sessions[0].id)
          } else {
            this.createNewSession()
          }
        }
      } catch (error) {
        console.error('删除会话失败', error)
      }
    },
    async renameSession(id, name) {
      try {
        const updatedSession = await chatApi.renameSession(id, name)
        const session = this.sessions.find(s => s.id === id)
        if (session) {
          session.name = updatedSession.name
        }
      } catch (error) {
        console.error('重命名会话失败', error)
      }
    }
  }
})
