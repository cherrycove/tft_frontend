import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/champions',
    name: 'Champions',
    component: () => import('../views/Champions.vue')
  },
  {
    path: '/traits',
    name: 'Traits',
    component: () => import('../views/Traits.vue')
  },
  {
    path: '/compositions',
    name: 'Compositions',
    component: () => import('../views/Compositions.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
