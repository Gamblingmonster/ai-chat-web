/**
 * 基础请求工具封装
 */
const BASE_URL = 'http://localhost:3000/api';

export const request = async (url, options = {}) => {
  const { method = 'GET', headers = {}, body } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config = {
    method,
    headers: defaultHeaders,
    ...options,
  };

  if (body && typeof body === 'object') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    // 如果是流式响应，直接返回 response 对象
    if (config.headers['Content-Type'] === 'text/event-stream' || url === '/chat') {
      return response;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '请求失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Request Error:', error);
    throw error;
  }
};
