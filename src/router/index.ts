/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/IndexPage.vue'),
    },
    {
      path: '/show',
      component: () => import('@/pages/ShowPage.vue')
    }
  ],
})

export default router
