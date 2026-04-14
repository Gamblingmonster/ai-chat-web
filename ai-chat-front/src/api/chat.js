import { request } from './request';

/**
 * 聊天 API
 */
export const chatApi = {
  /**
   * 发送聊天消息 (流式)
   */
  async sendMessageStream(messages, sessionId) {
    return await request('/chat', {
      method: 'POST',
      body: { messages, sessionId }
    });
  },

  /**
   * 获取会话列表
   */
  async getSessions() {
    return await request('/sessions', {
      method: 'GET'
    });
  },

  /**
   * 创建新会话
   */
  async createSession(name) {
    return await request('/sessions', {
      method: 'POST',
      body: { name }
    });
  },

  /**
   * 获取会话消息
   */
  async getSessionMessages(sessionId) {
    return await request(`/sessions/${sessionId}/messages`, {
      method: 'GET'
    });
  },

  /**
   * 删除会话
   */
  async deleteSession(sessionId) {
    return await request(`/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 重命名会话
   */
  async renameSession(sessionId, name) {
    return await request(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: { name }
    });
  },

  /**
   * 联网搜索
   */
  async search(query) {
    return await request('/search', {
      method: 'POST',
      body: { query }
    });
  },

  /**
   * 生成图片
   */
  async generateImage(prompt) {
    return await request('/image', {
      method: 'POST',
      body: { prompt }
    });
  },

  /**
   * 上传文件
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/upload', {
      method: 'POST',
      body: formData
    });
  }
};
