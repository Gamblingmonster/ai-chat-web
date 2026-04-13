import { createRouter, createWebHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue') // 懒加载首页组件
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue') // 使用新的 Chat.vue
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router