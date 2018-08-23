import Vue from 'vue'
import Router from 'vue-router'
import TheDashboard from '@/views/TheDashboard'
import TheLogIn from '@/views/LogIn/TheLogIn'
import TheSignUp from '@/views/LogIn/TheSignUp'

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
        }
      ]
    }
  ]
})
