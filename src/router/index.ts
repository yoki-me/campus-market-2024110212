import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/trades',
      name: 'trades',
      component: () => import('../views/TradeView.vue'),
    },
    {
      path: '/lostfounds',
      name: 'lostfounds',
      component: () => import('../views/LostFoundView.vue'),
    },
    {
      path: '/groupbuys',
      name: 'groupbuys',
      component: () => import('../views/GroupBuyView.vue'),
    },
    {
      path: '/errands',
      name: 'errands',
      component: () => import('../views/ErrandView.vue'),
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('../views/ListView.vue'),
    },
    {
      path: '/detail/:type/:id',
      name: 'detail',
      component: () => import('../views/DetailView.vue'),
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('../views/PublishView.vue'),
    },
    {
      path: '/message',
      name: 'message',
      component: () => import('../views/MessageView.vue'),
    },
    {
      path: '/chat/:conversationId',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
    },
  ],
})

export default router
