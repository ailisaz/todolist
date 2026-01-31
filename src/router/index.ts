import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginSignUp.vue'),
    },
    {
      path: '/news',
      name: 'news',
      component: ()=> import('../views/MainView.vue'),
    },
    {
      path: '/',
      name: 'todolist',
      component: ()=> import('../views/TodoList.vue'),
    }
  ],
})

export default router
