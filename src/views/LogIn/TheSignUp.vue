<template>
    <div>
        <h1>Sign up to start improving your handwriting!</h1>

        <input
          type='text'
          ref='username_input'
          placeholder="Username"
          class='sign-up-input'
          v-model="userName">

        <input
          type='password'
          ref='password_input'
          placeholder="Password"
          class='sign-up-input'
          v-model="userPassword">

        <input
          type='password'
          ref='password_confirm_input'
          placeholder="Confirm Password"
          class='sign-up-input'
          v-model="userConfirmPassword">

        <button
          v-on:click="attemptSignup()"
          id='sign-up-button'>
            Sign Up
        </button>

        <div
          v-if="signUpFailed"
          id='sign-up-failed-text'>
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
      signUpFailed: false,
      userPassword: '',
      userConfirmPassword: '',
      errorMessage: '',
      userName: ''
    }
  },

  methods: {

    containsSpaces: function (str) {
      return str.indexOf(' ') >= 0
    },

    attemptSignup: function () {
      this.signUpFailed = true

      console.log(constants.serverURL)

      if (this.userPassword !== this.userConfirmPassword) {
        this.errorMessage = 'Error! Passwords do not match.'
      } else if (this.userPassword.length < 5) {
        this.errorMessage = 'Error! Password must be at least 5 characters long.'
      } else if (this.containsSpaces(this.userPassword)) {
        this.errorMessage = 'Error! Password cannot contain spaces.'
      } else if (this.containsSpaces(this.userName)) {
        this.errorMessage = 'Error! Username cannot contain spaces.'
      } else if (this.userName.length > 15) {
        this.errorMessage = 'Error! Username cannot be more than 15 characters long.'
      } else {
        var http = new XMLHttpRequest()
        var duplicateUsernameFlag = ''
        var vm = this
        this.signUpFailed = false

        http.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            duplicateUsernameFlag = JSON.parse(this.responseText)

            if (duplicateUsernameFlag.result === 'yes') {
              vm.signUpFailed = true
              vm.errorMessage = 'Error! Username has already been taken.'
            } else if (duplicateUsernameFlag.result === 'no') {
              vm.signUpSuccess()
            }
          } else if (this.readyState === 4) {
            vm.signUpFailed = true
            vm.errorMessage = 'Error! Failed to connect to server. Please try again later.'
          }
        }

        http.open('POST', constants.serverURL + '/api/signup?q=' + this.userName, true)
        http.send()
      }
    },

    signUpSuccess: function () {
      var http = new XMLHttpRequest()
      var response = ''
      var vm = this

      http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          response = JSON.parse(this.responseText)

          if (response.result === 'success') {
            console.log('Successfully signed up with user: ' + vm.userName + ' password: ' + vm.userPassword)
            vm.$emit('signupSuccess', vm.userName)
          } else {
            console.log('Failed to update database.')
            vm.signUpFailed = true
            vm.errorMessage = 'Failed to add new user to server. Please try again later.'
          }
        } else if (this.readyState === 4) {
          vm.signUpFailed = true
          vm.errorMessage = 'Failed to communicate with server. Please try again later.'
        }
      }

      http.open('POST', constants.serverURL + '/api/signupnewuser?user=' + this.userName + '&pass=' + this.userPassword, true)
      http.send()
    }
  }
}
</script>

<style scoped>
  .sign-up-input {
    display: block;
    margin-left: calc(50% - 150px);
    margin-top: 20px;
    width: 300px;
    font-size: 16px;
    height: 30px;
  }

  #sign-up-button {
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
  #sign-up-button:hover {
    background-color: #4CAF50;
  }
  #sign-up-button:focus {
    outline: none;
  }

  #sign-up-failed-text {
    color: darkred;
    margin-top: 10px;
    font-size: 14px;
  }

</style>
