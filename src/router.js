import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home/Home.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    }
  ],

  scrollBehavior(to) {
    return to.hash
      ? { el: to.hash, behavior: 'smooth' }
      : { top: 0 }
  }
})