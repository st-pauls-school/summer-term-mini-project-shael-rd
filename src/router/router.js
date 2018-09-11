import Vue from 'vue'
import Router from 'vue-router'
import TheDashboard from '@/views/TheDashboard'
import TheLogIn from '@/views/LogIn/TheLogIn'
import TheSignUp from '@/views/LogIn/TheSignUp'
import TheInfo from '@/views/InnerApp/TheInfo'
import ThePractice from '@/views/InnerApp/ThePractice'
import TheStatistics from '@/views/InnerApp/TheStatistics'
import TheTest from '@/views/InnerApp/TheTest'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: TheDashboard,
      children: [
        {
          path: '/login',
          name: 'TheLogIn',
          component: TheLogIn
        },
        {
          path: '/signup',
          name: 'TheSignUp',
          component: TheSignUp
        },
        {
          path: '/info',
          name: 'TheInfo',
          component: TheInfo
        },
        {
          path: '/practice',
          name: 'ThePractice',
          component: ThePractice
        },
        {
          path: '/statistics',
          name: 'TheStatistics',
          component: TheStatistics
        },
        {
          path: '/test',
          name: 'TheTest',
          component: TheTest
        }
      ]
    }
  ]
})
