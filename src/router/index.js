import Vue from 'vue'
import Router from 'vue-router'
import TheDashboard from '@/views/TheDashboard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: TheDashboard
    }
  ]
})
