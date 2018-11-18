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
                <h3>Part {{testNo}} of {{totalTests}}</h3>
                <button v-on:click="nextButton">Next</button>
            </div>
            <div id='canvasContainer'>
                <WritingCanvas
                  v-bind:text="text"
                  v-bind:scoreButtonPressed="false"
                  v-bind:time="0"
                  v-bind:isRefreshDisabled="true"
                  v-on:requestNewText="handleBlankRequest"
                  v-on:returnScore="handleReturnScore"
                  v-on:timer="handleToggleTimer"/>
            </div>

        </div>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'
import {constants} from '@/constants.js'

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
      testMessage: '',
      time: 0,
      timeId: 0,
      testNo: 1,
      totalTests: 0,
      scoreButtonPressed: false,
      totalScore: 0
    }
  },

  methods: {
    startTest: function (type) {
      this.testStarted = true
      this.testType = type
      if (type === 'letter') {
        this.testMessage = 'Letter Test'
        this.totalTests = 3

        this.text = 'ABCDEFGHIJK LMNOPQRSTUV WXYZabcdefghijklm nopqrstuvwxyz'
      } else if (type === 'word') {
        this.text = ''
        this.getNewWord()

        this.testMessage = 'Word Test'
        this.totalTests = 10
      } else {
        var numberOfWords = 3 + Math.floor(Math.random() * 4)
        this.text = ''
        for (; numberOfWords > 0; numberOfWords--) {
          this.getNewWord()
        }

        this.testMessage = 'Sentence Test'
        this.totalTests = 5
      }
    },

    nextButton: function () {
      this.testNo++

      this.scoreButtonPressed = true
      this.scoreButtonPressed = false

      this.startTest(this.testType)
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
    },

    handleBlankRequest: function () {
      console.log('oof1')
    },

    handleToggleTimer: function () {
      console.log('oof2')
    },

    handleReturnScore: function (score) {
      this.totalScore += score
      console.log(score)
    }
  }
}
</script>

<style scoped>

#listContainer, #canvasContainer {
  display: inline-block;
  vertical-align: top;
}

#canvasContainer {
  margin-right: 110px;
}

#listContainer h3 {
  border-bottom: 1px solid black;
  margin: 0;
  padding: 16px;
}

#listContainer button {
  margin-top: 20px;
  height: 60px;
  width: 120px;
  border: 0;

  background-color: #333;
  color: white;
  font-size: 16px;
}

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
#landingPage button:focus, #listContainer button:focus {
  outline: none;
}
#landingPage button:hover, #listContainer button:hover {
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
