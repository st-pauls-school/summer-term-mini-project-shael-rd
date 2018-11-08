<template>
    <div>
        <div
          id='landingPage'
          v-if="testStarted === false">

            <h1>What kind of test would you like to take?</h1>
            <button v-on:click="startTest('letter')">Letter</button>
            <button v-on:click="startTest('word')">Word</button>
            <button v-on:click="startTest('sentence')">Sentence</button>

        </div>

        <div
          id='testArea'
          v-if="testStarted === true">

            <h1>{{testMessage}}</h1>
            <div id='listContainer'>
                
            </div>
            <div id='canvasContainer'>
                <WritingCanvas
                  ref='writingCanvas'
                  v-bind:text="text"
                  v-bind:scoreButtonPressed="scoreButtonPressed"
                  v-bind:time="time"
                  v-bind:disableRefresh="true"
                  v-on:requestNewText="verticalButtonOnClick(selectedOption)"
                  v-on:returnScore="handleReturnedScore"
                  v-on:timer="handleToggleTimer"/>
            </div>

        </div>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'
import constants from '@/constants.js'

export default {
  name: 'TheTest',
  components: {
    WritingCanvas
  },

  data () {
    return {
      testStarted: false,
      testType: '',
      text: '',
      testMessage: ''
    }
  },

  methods: {
    startTest: function (type) {
      this.testStarted = true
      this.testType = type
      if (type === 'letter') {
        this.testMessage = 'Letter Test'
      } else if (type === 'word') {
        this.testMessage = 'Word Test'
      } else {
        this.testMessage = 'Sentence Test'
      }
    },

    getNewWord: function () {
      var http = new XMLHttpRequest()
      var serverResponse = ''
      var vm = this

      http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          serverResponse = JSON.parse(this.responseText)

          if (serverResponse.result === 'no') {
            vm.text = 'Error: server connection failed'
          } else {
            if (vm.text.length !== 0) {
              vm.text += ' '
            }
            vm.text += serverResponse.result.word
          }
        } else if (this.readyState === 4) {
          vm.text = 'Error: server connection failed'
        }
      }

      http.open('POST', constants.serverURL + '/api/randomWord', true)
      http.send()
    }
  }
}
</script>

<style scoped>

#landingPage h1 {
  margin-top: 8%;
}
#landingPage button {
  margin-top: 4%;
  width: 150px;
  height: 60px;
  background-color: #333;
  color: white;
  font-size: 16px;
  border: none;
}
#landingPage button:focus {
  outline: none;
}
#landingPage button:hover {
  cursor: pointer;
  background: #111;
}
#landingPage button:nth-of-type(2) {
  margin: 30px 75px 30px 75px;
}

#testArea {
  margin-top: 10px;
}
</style>
