<template>
    <div>
        <div
          id='landingPage'
          v-if="stage === 0">

            <h1>What kind of test would you like to take?</h1>
            <button v-on:click="startTest('alphabet')">Alphabet</button>
            <button v-on:click="startTest('word')">Word</button>
            <button v-on:click="startTest('sentence')">Sentence</button>

        </div>

        <div
          id='testArea'
          v-if="stage === 1">

            <h1>{{testMessage}}</h1>
            <div id='listContainer'>
                <h3>Part {{testNo}} of {{totalTests}}</h3>
                <button v-on:click="nextButton">Next</button>
            </div>
            <div id='canvasContainer'>
                <WritingCanvas
                  v-bind:text="text"
                  v-bind:isScoreButtonActive="isScoreButtonActive"
                  v-bind:time="time"
                  v-bind:isRefreshDisabled="true"
                  v-on:requestNewText="handleBlankRequest"
                  v-on:returnScore="handleReturnScore"
                  v-on:timer="handleToggleTimer"
                  v-on:returnAccuracy="handleReturnAccuracy"/>
            </div>
        </div>

        <div
          id='summaryPage'
          v-if="stage === 2">

            <h2>Your total score: {{totalScore}}</h2>
            <h2>Your total time: {{time}}</h2>
            <h2>Highscore: {{highscore}}</h2>
            <div id='chartContainer' style='width: 900px; height: 500px;'></div>
        </div>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'
import getNewWord from '@/store/modules/getNewWord.js'
import {constants} from '@/constants.js'

export default {
  name: 'TheTest',
  components: {
    WritingCanvas
  },

  data () {
    return {
      stage: 0,
      testType: '',
      text: '',
      testMessage: '',
      time: 0,
      timeId: 0,
      testNo: 1,
      totalTests: 0,
      isScoreButtonActive: false,
      totalScore: 0,
      totalAccuracy: 0,
      userid: 0,
      highscore: 0
    }
  },

  methods: {
    startTest: function (type) {
      this.stage = 1
      this.testType = type
      if (type === 'alphabet') {
        this.text = ''
        this.testMessage = 'Alphabet Test'
        this.totalTests = 3

        setTimeout(() => {
          this.text = 'ABCDEFGHIJK LMNOPQRSTUV WXYZabcdefghijklm nopqrstuvwxyz'
        }, 2)
      } else if (type === 'word') {
        this.text = ''
        getNewWord.getNewWord(this)

        this.testMessage = 'Word Test'
        this.totalTests = 10
      } else {
        var numberOfWords = 3 + Math.floor(Math.random() * 4)
        this.text = ''
        for (; numberOfWords > 0; numberOfWords--) {
          getNewWord.getNewWord(this)
        }

        this.testMessage = 'Sentence Test'
        this.totalTests = 5
      }
    },

    nextButton: function () {
      this.testNo++

      this.isScoreButtonActive = true
      setTimeout(() => {
        this.isScoreButtonActive = false
      }, 2)
    },

    handleBlankRequest: function () {
      console.log('This function should never run')
    },

    handleToggleTimer: function (condition) {
      if (condition === 'stop') {
        clearInterval(this.timeId)
      } else if (condition === 'start') {
        this.timeId = setInterval(_ => { this.time = ((this.time * 10) + 1) / 10 }, 100)
      }
    },

    handleReturnScore: function (score) {
      this.totalScore += Number(score)
      console.log('Score: ', Number(score))

      if (this.testNo > this.totalTests) {
        this.stage = 2
        this.totalScore = this.totalScore.toFixed(2)
        this.submitScore()
      } else {
        this.startTest(this.testType)
      }
    },

    handleReturnAccuracy: function (accuracy) {
      this.totalAccuracy += Number(accuracy)
      console.log('Accuracy: ', Number(accuracy))
    },

    getUser: async function () {
      var vm = this
      return new Promise(function (resolve, reject) {
        let http = new XMLHttpRequest()
        let serverResponse = ''

        http.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            serverResponse = JSON.parse(this.responseText)
            console.log(serverResponse)

            if (serverResponse === 'no') {
              reject(new Error('Failed to grab userid from database.'))
            } else {
              console.log(serverResponse.userid)
              resolve(serverResponse.userid)
            }
          } else if (this.readyState === 4) {
            reject(new Error('Failed to connect to database.'))
          }
        }

        http.open('POST', constants.serverURL + '/api/getUserId?username=' + vm.$route.params.username, true)
        http.send()
      })
    },

    submitScore: async function () {
      try {
        this.userid = await this.getUser()
        console.log('UserId: ', this.userid)
        if (!this.userid) {
          console.log('No user with matching username found.')
          return
        }
      } catch (e) {
        return console.log('Error in grabbing userId. Error: ', e)
      }

      var http = new XMLHttpRequest()
      var serverResponse = ''

      http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          serverResponse = JSON.parse(this.responseText)

          if (serverResponse.result === 'no') {
            console.log('Failed to update database.')
          } else {
            console.log('Successfully uploaded test results to database.')
          }
        } else if (this.readyState === 4) {
          console.log('Error: server connection failed')
        }
      }

      var url = constants.serverURL + '/api/submitScore?testtype=' + this.testType
      url += '&userid=' + this.userid
      url += '&score=' + this.totalScore
      url += '&time=' + this.time
      url += '&accuracy=' + (this.totalAccuracy / this.totalTests).toFixed(3)

      http.open('POST', url, true)
      http.send()

      this.getHighscore()
      this.drawChart()
    },

    getChartData: async function () {
      var vm = this
      return new Promise(function (resolve, reject) {
        let http = new XMLHttpRequest()
        let serverResponse = ''

        http.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            serverResponse = JSON.parse(this.responseText)
            console.log(serverResponse.score)

            if (serverResponse === 'no') {
              reject(new Error('Failed to grab recent results from database.'))
            } else {
              resolve(serverResponse)
            }
          } else if (this.readyState === 4) {
            reject(new Error('Failed to connect to database.'))
          }
        }

        let url = constants.serverURL + '/api/getRecentResults?userid=' + this.userid
        url += '&testtype=' + vm.testType
        url += '&number=10'
        console.log('Local url: ', url)

        http.open('POST', url, true)
        http.send()
      })
    },

    drawChart: async function () {
      try {
        var recentScores = await this.getChartData()
        console.log(recentScores)
        if (!recentScores[0]) {
          console.log('No recent results found.')
          return
        }
      } catch (e) {
        return console.log('Error in grabbing test results. Error: ', e)
      }
    },

    getHighscore: function () {
      var http = new XMLHttpRequest()
      var serverResponse = ''
      var vm = this

      http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          serverResponse = JSON.parse(this.responseText)

          if (serverResponse.highscore === 0) {
            console.log('No highscore received.')
          } else {
            console.log('Successfully grabbed highscore: ', serverResponse.highscore, '.')
          }

          if (serverResponse.highscore > vm.totalScore) {
            vm.highscore = serverResponse.highscore
          } else {
            vm.highscore = 'New highscore!'
          }
        } else if (this.readyState === 4) {
          console.log('Error: server connection failed')
        }
      }

      let url = constants.serverURL + '/api/getHighscore?userid=' + this.userid
      url += '&testtype=' + this.testType

      http.open('POST', url, true)
      http.send()
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
