<template>
    <div id='pageContent'>
        <h1>{{headerText}}</h1>
        <div id='listContainer'>
            <ul>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: selectedTextOption === 0}"
                      v-on:click="changeTextType(0)">
                        Letter
                    </button>
                </li>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: selectedTextOption === 1}"
                      v-on:click="changeTextType(1)">
                        Word
                    </button>
                </li>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: selectedTextOption === 2}"
                      v-on:click="changeTextType(2)">
                        Sentence
                    </button>
                </li>
            </ul>
        </div>
        <div id='canvasContainer'>
            <WritingCanvas
            v-bind:text="text"
            v-bind:isScoreButtonActive="isScoreButtonActive"
            v-bind:time="time"
            v-bind:isWordTest="false"
            v-bind:isRefreshDisabled="false"
            v-on:requestNewText="changeTextType(selectedTextOption)"
            v-on:returnScore="handleReturnedScore"
            v-on:timer="handleToggleTimer"/>
        </div>
        <div id='timerScoreContainer'>
            <h3>Time: {{time}}{{time % 1 === 0 ? '.0' : ''}} secs</h3>
            <h3>Score: </h3>
            <button
              v-on:click="getScore"
              v-if="!isScoreButtonActive">
                Calculate
            </button>
            <h3 v-if="isScoreButtonActive"> {{score}}</h3>
        </div>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'
import getNewWord from '@/store/modules/getNewWord.js'

export default {
  name: 'ThePractice',
  components: {
    WritingCanvas
  },

  data () {
    return {
      selectedTextOption: 0,
      text: '',
      headerText: 'Practice writing a random character!',
      time: 0,
      timeId: 0,
      score: 0,
      isScoreButtonActive: false
    }
  },

  mounted () {
    this.changeTextType(this.selectedTextOption)
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
      this.isScoreButtonActive = true
    },

    resetTimer: function () {
      this.time = 0
    },

    changeTextType: function (buttonNo) {
      this.selectedTextOption = buttonNo

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
        getNewWord.getNewWord(this)
      } else {
        var numberOfWords = 3 + Math.floor(Math.random() * 4)
        this.headerText = 'Practice writing a random sentence!'
        this.text = ''

        for (; numberOfWords > 0; numberOfWords--) {
          getNewWord.getNewWord(this)
        }
      }
      this.resetTimer()
      this.isScoreButtonActive = false
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

    #listContainer ul li {
      padding: 12px 0 12px 0;
      border: 0;
      border-bottom: 1px solid black;
    }

    #listContainer ul li button:hover:not(.verticalButtonActive) {
      background-color: #111;
    }
    #listContainer ul li button:hover, #timerScoreContainer button:hover {
      cursor: pointer;
    }
    #timerScoreContainer button:hover {
      background-color: #111;
    }
    #listContainer ul li button:focus, #timerScoreContainer button:focus {
      outline: none;
    }

    .verticalButtonActive {
      background-color: #4CAF50 !important;
    }

    #listContainer ul li button {
      margin: 0;
      height: 59px;
      width: 120px;
      border: 0;

      background-color: #333;
      color: white;
      font-size: 16px;
    }

    #listContainer li:last-child {
      border-bottom: 0px !important;
    }

    #listContainer ul {
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
