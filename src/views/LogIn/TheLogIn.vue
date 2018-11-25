<template>
    <div>
        <h1>Please enter your log in details below</h1>

        <input
          type='text'
          ref='username_input'
          placeholder="Username"
          class='login-input'
          v-model="userName">

        <input
          type='password'
          ref='password_input'
          placeholder="Password"
          class='login-input'
          v-model="userPassword">

        <button
          v-on:click="attemptLogin()"
          id='login-button'>
            Log In
        </button>

        <div
          v-if="loginFailed"
          id='login-failed-text'>
            {{errorMessage}}
        </div>
    </div>
</template>

<script>
import {constants} from '@/constants.js'

export default {
  name: 'TheLogIn',

  data () {
    return {
      loginFailed: false,
      errorMessage: '',
      userPassword: '',
      userName: ''
    }
  },

  methods: {
    attemptLogin: function () {
      this.loginFailed = true

      if (this.userName.length === 0) {
        this.errorMessage = 'Please enter a username.'
      } else if (this.userPassword.length === 0) {
        this.errorMessage = ' Please enter a password.'
      } else {
        this.loginFailed = false

        var http = new XMLHttpRequest()
        var serverResponse = ''
        var vm = this

        http.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            serverResponse = JSON.parse(this.responseText)

            if (serverResponse.result === 'yes') {
              vm.loginSuccess()
            } else if (serverResponse.result === 'no') {
              vm.loginFailed = true
              vm.errorMessage = 'Error: invalid username or password.'
            }
          } else if (this.readyState === 4) {
            vm.loginFailed = true
            vm.errorMessage = 'Error connecting to server. Please try again later.'
          }
        }

        http.open('POST', constants.serverURL + '/api/login?q=' + this.userName + '&r=' + this.userPassword, true)
        http.send()
      }
    },

    loginSuccess: function () {
      console.log('Successful login for user: ' + this.userName)
      this.$emit('loginSuccess', this.userName)
    }
  }
}
</script>

<style scoped>
  .login-input {
    display: block;
    margin-left: calc(50% - 150px);
    margin-top: 20px;
    width: 300px;
    font-size: 16px;
    height: 30px;
  }

  #login-button {
    display: block;
    margin-top: 20px;
    margin-left: calc(50% - 100px);
    width: 200px;
    height: 50px;
    font-size: 16px;
    color: white;
    background-color: #333;
    cursor: pointer;
  }
  #login-button:hover {
    background-color: #4CAF50;
  }

  #login-failed-text {
    color: darkred;
    margin-top: 10px;
    font-size: 14px;
  }

</style>
