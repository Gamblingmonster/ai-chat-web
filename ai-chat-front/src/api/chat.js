import { request } from './request';

/**
 * 聊天 API
 */
export const chatApi = {
  /**
   * 发送聊天消息 (流式)
   */
  async sendMessageStream(messages) {
    return await request('/chat', {
      method: 'POST',
      body: { messages }
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
