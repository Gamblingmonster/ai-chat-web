<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="logo">🥟</div>
      <h1 class="title">豆沙包 AI</h1>
      <p class="subtitle">您的智能全栈对话助手，支持搜索、绘图与文件分析</p>
      
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🌐</div>
          <h3>联网搜索</h3>
          <p>集成 Serper，实时获取最新资讯</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>AI 绘图</h3>
          <p>支持 Pollinations.ai，创意无限</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📄</div>
          <h3>文件分析</h3>
          <p>一键上传，精准解析文档内容</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎙️</div>
          <h3>语音交互</h3>
          <p>支持 STT 与 TTS，沟通更自然</p>
        </div>
      </div>

      <div class="action-buttons">
        <router-link to="/chat" class="primary-btn">立即开始对话</router-link>
      </div>
    </div>

    <footer class="footer">
      <p>© 2026 豆沙包 AI - Powered by Qwen & MongoDB</p>
    </footer>
  </div>
</template>

<script setup>
// HomeView Logic
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  text-align: center;
}

.hero-section {
  max-width: 900px;
  width: 100%;
}

.logo {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title {
  font-size: 48px;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 20px;
  color: #576574;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.feature-card {
  background: white;
  padding: 30px 20px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 14px;
  color: #8395a7;
}

.action-buttons {
  margin-top: 30px;
}

.primary-btn {
  display: inline-block;
  padding: 15px 40px;
  background-color: #10a37f;
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.3);
}

.primary-btn:hover {
  background-color: #0d8a6a;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 163, 127, 0.4);
}

.footer {
  margin-top: auto;
  padding: 20px;
  color: #8395a7;
  font-size: 14px;
}
</style>
