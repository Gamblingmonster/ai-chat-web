<template>
  <div class="home">
    <h1>欢迎来到 AI 聊天应用</h1>
    <p>这是一个全栈 AI 聊天应用的首页</p>
    <router-link to="/chat">前往聊天页面</router-link>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  text-align: center;
  padding-top: 50px;
}
</style>