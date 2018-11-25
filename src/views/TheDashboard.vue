<template>
    <div>

        <ul class='header-list'>
            <template v-if="!hasLoggedIn">

                <li>
                    <router-link
                      :to="{name: 'TheLogIn'}"
                      v-bind:class="['header-list-item', {link_part_active: selectedOption === 0}]"
                      v-on:click.native="selectedOption = 0"
                      tag='li'>
                        Log In
                    </router-link>
                </li>

                <li>
                    <router-link
                      :to="{name: 'TheSignUp'}"
                      v-bind:class="['header-list-item', {link_part_active: selectedOption === 1}]"
                      v-on:click.native="selectedOption = 1"
                      tag='li'>
                        Sign Up
                    </router-link>
                </li>

            </template>
            <template v-if="hasLoggedIn">

                <li>
                    <router-link
                      :to="{name: 'TheInfo'}"
                      v-bind:class="['header-list-item', {link_part_active: selectedOption === 0}]"
                      v-on:click.native="selectedOption = 0"
                      tag='li'>
                        Info
                    </router-link>
                </li>

                <li>
                    <router-link
                      :to="{name: 'ThePractice'}"
                      v-bind:class="['header-list-item', {link_part_active: selectedOption === 1}]"
                      v-on:click.native="selectedOption = 1"
                      tag='li'>
                        Practice
                    </router-link>
                </li>

                <li>
                    <router-link
                      :to="{name: 'TheTest', params: {username: this.username}}"
                      v-bind:class="['header-list-item', {link_part_active: selectedOption === 2}]"
                      v-on:click.native="selectedOption = 2"
                      tag='li'>
                        Test
                    </router-link>
                </li>

                <li>
                    <router-link
                      :to="{name: 'TheStatistics'}"
                      v-bind:class="['header-list-item', {link_part_active: selectedOption === 3}]"
                      v-on:click.native="selectedOption = 3"
                      tag='li'>
                        Statistics
                    </router-link>
                </li>

            </template>
        </ul>

        <div id='page-container'>
            <TheLogIn @loginSuccess="onLogin" v-if="selectedOption === 0 && !hasLoggedIn"/>
            <TheSignUp @signupSuccess="onLogin" v-if="selectedOption === 1 && !hasLoggedIn"/>
            <TheInfo v-if="selectedOption === 0 && hasLoggedIn"/>
            <ThePractice v-if="selectedOption === 1 && hasLoggedIn"/>
            <TheTest v-if="selectedOption === 2 && hasLoggedIn"/>
            <TheStatistics v-if="selectedOption === 3 && hasLoggedIn"/>
        </div>

    </div>
</template>

<script>
import TheLogIn from '@/views/LogIn/TheLogIn'
import TheSignUp from '@/views/LogIn/TheSignUp'
import TheInfo from '@/views/InnerApp/TheInfo'
import ThePractice from '@/views/InnerApp/ThePractice'
import TheStatistics from '@/views/InnerApp/TheStatistics'
import TheTest from '@/views/InnerApp/TheTest'

export default {
  name: 'TheDashboard',
  components: {
    TheLogIn,
    TheSignUp,
    TheInfo,
    ThePractice,
    TheStatistics,
    TheTest
  },

  data () {
    return {
      selectedOption: 0,
      hasLoggedIn: false,
      username: ''
    }
  },

  methods: {
    onLogin: function (username) {
      this.username = username
      this.hasLoggedIn = true
      this.SelectedOption = 0
      console.log('Successfully accessed internal app with user: ' + username)
    }
  }
}
</script>

<style scoped>
    .header-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
    }

    .header-list li {
        float: left;
        display: block;
        color: white;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
    }

    .header-list-item {
        padding: 14px 16px;
    }
    .header-list-item:hover:not(.link_part_active) {
        background-color: #111;
    }

    .link_part_active {
        background-color: #4CAF50;
    }
</style>
