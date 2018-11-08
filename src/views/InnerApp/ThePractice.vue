<template>
    <div id='pageContent'>
        <h1>{{headerText}}</h1>
        <div id='listContainer'>
            <ul class='verticalPractice'>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: selectedOption === 0}"
                      v-on:click="verticalButtonOnClick(0)">
                        Letter
                    </button>
                </li>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: selectedOption === 1}"
                      v-on:click="verticalButtonOnClick(1)">
                        Word
                    </button>
                </li>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: selectedOption === 2}"
                      v-on:click="verticalButtonOnClick(2)">
                        Sentence
                    </button>
                </li>
            </ul>
        </div>
        <div id='canvasContainer'>
            <WritingCanvas
            ref='writingCanvas'
            v-bind:text="text"
            v-bind:scoreButtonPressed="scoreButtonPressed"
            v-bind:time="time"
            v-bind:disableRefresh="false"
            v-on:requestNewText="verticalButtonOnClick(selectedOption)"
            v-on:returnScore="handleReturnedScore"
            v-on:timer="handleToggleTimer"/>
        </div>
        <div id='timerScoreContainer'>
            <h3>Time: {{time}}{{time % 1 === 0 ? '.0' : ''}} secs</h3>
            <h3>Score: </h3>
            <button
              v-on:click="getScore()"
              v-if="scoreButtonPressed === false">
                Calculate
            </button>
            <h3 v-if="scoreButtonPressed === true"> {{score}}</h3>
        </div>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'
import constants from '@/constants.js'

export default {
  name: 'ThePractice',
  components: {
    WritingCanvas
  },

  data () {
    return {
      selectedOption: 0,
      text: '',
      headerText: 'Practice writing a random character!',
      refreshCanvas: false,
      time: 0,
      timeId: 0,
      score: 0,
      scoreButtonPressed: false
    }
  },

  mounted () {
    this.verticalButtonOnClick(this.selectedOption)
  },

  methods: {
    handleReturnedScore: function (returnedScore) {
      this.score = returnedScore
    },

    handleToggleTimer: function (condition) {
      if (condition === 'stop') {
        clearInterval(this.timeId)
      } else if (condition === 'start') {
        this.timeId = setInterval(_ => { this.time = ((this.time * 10) + 1) / 10 }, 100)
      }
    },

    getScore: function () {
      this.scoreButtonPressed = true
    },

    resetTimer: function () {
      this.time = 0
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

    verticalButtonOnClick: function (buttonNo) {
      this.selectedOption = buttonNo

      if (buttonNo === 0) {
        this.headerText = 'Practice writing a random character!'
        var randomLetter = 'A'.charCodeAt(0)
        randomLetter += Math.floor(Math.random() * 26)

        if (Math.floor(Math.random() * 2) === 0) {
          randomLetter += ('a'.charCodeAt(0) - 'A'.charCodeAt(0))
        }

        this.text = String.fromCharCode(randomLetter)
      } else if (buttonNo === 1) {
        this.text = ''
        this.headerText = 'Practice writing a random word!'
        this.getNewWord()
        console.log(this.text)
      } else {
        var numberOfWords = 3 + Math.floor(Math.random() * 4)
        this.headerText = 'Practice writing a random sentence!'
        this.text = ''

        for (; numberOfWords > 0; numberOfWords--) {
          this.getNewWord()
        }
      }
      this.resetTimer()
      this.scoreButtonPressed = false
    }
  }
}
</script>

<style scoped>
    #pageContent {
      margin-top: 15px;
      text-align: center;
    }

    #listContainer, #canvasContainer {
      display: inline-block;
      vertical-align: top;
    }

    #canvasContainer {
      margin-right: 140px;
    }

    #listContainer {
      margin-top: 30px;
      height: 181px;
      width: 140px;
    }

    .verticalPractice li {
      padding: 12px 0 12px 0;
      border: 0;
      border-bottom: 1px solid black;
    }

    .verticalPractice li button:hover:not(.verticalButtonActive) {
      background-color: #111;
    }
    .verticalPractice li button:hover, #timerScoreContainer button:hover {
      cursor: pointer;
    }
    #timerScoreContainer button:hover {
      background-color: #111;
    }
    .verticalPractice li button:focus, #timerScoreContainer button:focus {
      outline: none;
    }

    .verticalButtonActive {
      background-color: #4CAF50 !important;
    }

    .verticalPractice li button {
      margin: 0;
      height: 59px;
      width: 120px;
      border: 0;

      background-color: #333;
      color: white;
      font-size: 16px;
    }

    .verticalPractice li:last-child {
      border-bottom: 0px !important;
    }

    .verticalPractice {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    #timerScoreContainer h3, #timerScoreContainer button {
      display: inline-block;
    }
    #timerScoreContainer h3:nth-child(2) {
      margin-left: 30px;
    }
    #timerScoreContainer button {
      width: 60px;
      height: 25px;
      color: white;
      background-color: #333;
      border: none;
      padding: 0;
    }
</style>
