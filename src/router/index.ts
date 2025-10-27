import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/builder',
      name: 'builder',
      component: () => import('../views/BuilderView.vue'),
    },
    {
      path: '/render',
      name: 'render',
      component: () => import('../views/RenderView.vue'),
    },
  ],
})

export default router