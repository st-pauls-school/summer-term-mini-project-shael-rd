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
        </ul>

        <div class='page-container'>
            <TheLogIn v-if="selectedOption === 0 && !hasLoggedIn"/>
            <TheSignUp v-if="selectedOption === 1 && !hasLoggedIn"/>
        </div>

    </div>
</template>

<script>
import TheLogIn from '@/views/LogIn/TheLogIn'
import TheSignUp from '@/views/LogIn/TheSignUp'

export default {
  name: 'TheDashboard',
  components: {
    TheLogIn,
    TheSignUp
  },
  data () {
    return {
      selectedOption: 0,
      hasLoggedIn: false
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
