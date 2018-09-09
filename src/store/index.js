import Vue from 'vue'
import Vuex from 'vuex'
import signup from '@/store/modules/signupState.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    signup
  }
})
