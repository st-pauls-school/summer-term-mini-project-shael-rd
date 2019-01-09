<template>
    <div id='pageContent'>
        <h1>{{headerText}}</h1>
        <div id='listContainer'>
            <ul>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: activeButton === 0}"
                      v-on:click="activateButton(0)">
                        Alphabet
                    </button>
                </li>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: activeButton === 1}"
                      v-on:click="activateButton(1)">
                        Word
                    </button>
                </li>
                <li>
                    <button
                      v-bind:class="{verticalButtonActive: activeButton === 2}"
                      v-on:click="activateButton(2)">
                        Sentence
                    </button>
                </li>
            </ul>
        </div>

        <div id='statsContainer'>
          <h2>Average score: {{avgScore}}</h2>
          <h2>Average time: {{avgTime}}</h2>
          <h2>Average accuracy: {{avgAccuracy}}</h2>
        </div>

        <GChart
          type='LineChart'
          v-bind:data="chartData"
          v-bind:options="chartOptions"
          v-if="!graphError"/>
        <t
          v-if="graphError"
          class='error-text'>
            {{graphError}}
        </t>

        <div id='canvasContainer'>
          <canvas
            id="drawingArea"
            v-bind:width="500"
            v-bind:height="300">
          </canvas>
          <canvas
            id="textArea"
            v-bind:width="500"
            v-bind:height="300">
          </canvas>
        </div>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'
import { GChart } from 'vue-google-charts'
import { constants } from '@/constants.js'

export default {
  name: 'ThePractice',
  props: {
    username: String
  },
  components: {
    WritingCanvas,
    GChart
  },

  data () {
    return {
      activeButton: 0,
      text: '',
      headerText: 'Alphabet Statistics',

      avgScore: 100,
      avgTime: 20,
      avgAccuracy: 0.789,

      userid: 0,
      chartData: [
        ['Date', 'Score']
      ],
      chartOptions: {},
      graphError: ''

    }
  },

  mounted () {
    this.activateButton(0)
    this.getUser()
  },

  methods: {
    activateButton: function (event) {
      this.activeButton = event

      switch (event) {
        case 0:
          this.headerText = 'Alphabet Statistics'
          this.getNewStats('alphabet')
          this.drawChart('alphabet')
          break
        case 1:
          this.headerText = 'Single Word Statistics'
          this.getNewStats('word')
          this.drawChart('word')
          break
        case 2:
          this.headerText = 'Sentence Statistics'
          this.getNewStats('sentence')
          this.drawChart('sentence')
          break
      }
    },

    getNewStats (type) {
      let http = new XMLHttpRequest()
      let serverResponse = ''
      let vm = this

      http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          serverResponse = JSON.parse(this.responseText)

          if (serverResponse.result === 'no') {
            console.log('Failed to fetch average scores database')
          } else {
            vm.avgScore = serverResponse[0].avg_score
            vm.avgTime = serverResponse[0].avg_time
            vm.avgAccuracy = serverResponse[0].avg_accuracy
            console.log(serverResponse[0])
          }
        }
      }
      var url = constants.serverURL + '/api/getAvgScores?type=' + type

      http.open('POST', url, true)
      http.send()
    },

    getChartData: async function (type) {
      var vm = this
      return new Promise(function (resolve, reject) {
        let http = new XMLHttpRequest()
        let serverResponse = ''

        http.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            serverResponse = JSON.parse(this.responseText)

            if (serverResponse === 'no') {
              reject(new Error('Failed to grab recent results from database.'))
              console.log(serverResponse)
            } else {
              resolve(serverResponse)
            }
          } else if (this.readyState === 4) {
            reject(new Error('Failed to connect to database.'))
          }
        }

        console.log('userid:', vm.userid)

        let url = constants.serverURL + '/api/getRecentResults?userid=' + vm.userid
        url += '&testtype=' + type
        url += '&number=100'

        http.open('POST', url, true)
        http.send()
      })
    },

    drawChart: async function (type) {
      try {
        var recentScores = await this.getChartData(type)
        console.log('recentScores.results.length: ', recentScores.results.length)
        if (recentScores.results.length === 0) {
          console.log('No recent results found.')
          this.graphError = 'Error fetching previous scores.'
          return
        } else {
          this.graphError = ''
        }
      } catch (e) {
        this.graphError = 'Error connecting to server. Please try again later.'
        return console.log('Error in grabbing test results. Error: ', e)
      }

      this.chartOptions = {
        hAxis: {title: 'Date'},
        vAxis: {title: 'Score', minValue: 0, maxValue: this.highscore},
        legend: 'none',
        pointSize: 7,
        curveType: 'function',
        height: 500
      }
      for (let i = 0; i < recentScores.results.length; i++) {
        let year = recentScores.results[i].date.slice(2, 4)
        let month = recentScores.results[i].date.slice(5, 7)
        let day = recentScores.results[i].date.slice(8, 10)
        let time = recentScores.results[i].date.slice(11, 16)

        this.chartData.push([(day + '/' + month + '/' + year + ' ' + time), recentScores.results[i].score])
      }
    },

    getUser: function () {
      var vm = this
      let http = new XMLHttpRequest()
      let serverResponse = ''

      http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          serverResponse = JSON.parse(this.responseText)

          if (serverResponse === 'no') {
            console.log('Failed to grab userid from database.')
          } else {
            vm.userid = serverResponse.userid
          }
        } else if (this.readyState === 4) {
          console.log('Failed to connect to database.')
        }
      }

      http.open('POST', constants.serverURL + '/api/getUserId?username=' + vm.username, true)
      http.send()
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

    #statsContainer {
      text-align: middle;
      margin-right: 15%;
    }

    #listContainer {
      margin-top: 30px;
      margin-left: 50px;
      height: 181px;
      width: 140px;
      float: left;
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

    .error-text {
      color: darkred;
      margin-top: 10px;
      font-size: 14px;
    }
</style>
