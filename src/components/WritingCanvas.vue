<template>
    <div>
        <canvas
          id="textArea"
          v-bind:width="500"
          v-bind:height="300">
        </canvas><!--
     --><canvas
          id="drawingArea"
          v-bind:width="500"
          v-bind:height="300"
          v-on:mousedown="handleMouseDown"
          v-on:mouseup="handleMouseUp"
          v-on:mouseleave="handleMouseLeave">
        </canvas>
        <div class="buttonDiv">
            <div class='buttonContainer'>
                <button
                  class="drawingToolsButton"
                  v-bind:class="{rubberButtonOnClick: isRubber === true}"
                  v-on:click="toggleRubber">
                    Rubber
                </button><!--
         --></div><!--
         --><div class='buttonContainer'><!--
             --><button
                  class="drawingToolsButton"
                  v-on:click="clearSurface">
                    Clear
                </button><!--
         --></div><!--
         --><div class='buttonContainer'><!--
             --><button
                  class="drawingToolsButton"
                  v-if="!isRefreshDisabled"
                  v-on:click="requestNewText">
                    Refresh
                </button><!--
             --><button
                  disabled
                  class="drawingToolsButton disabledButton"
                  v-if="isRefreshDisabled">
                    Refresh
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import scoreCalculator from '@/store/modules/scoreCalculator.js'
import {constants} from '@/constants.js'

export default {
  name: 'WritingCanvas',

  props: {
    text: String,
    isScoreButtonActive: Boolean,
    time: Number,
    isRefreshDisabled: Boolean,
    isWordTest: Boolean
  },

  data () {
    return {
      previousPos: 0,
      isNewDrawingPath: true,
      isTimerRunning: false,
      isRubber: false,
      drawingSurface: [
        {canvas: 0, ctx: 0}
      ],
      textSurface: [
        {canvas: 0, ctx: 0}
      ]
    }
  },

  mounted () {
    this.drawingSurface.canvas = document.getElementById('drawingArea')
    this.drawingSurface.ctx = this.drawingSurface.canvas.getContext('2d')

    this.textSurface.canvas = document.getElementById('textArea')
    this.textSurface.ctx = this.textSurface.canvas.getContext('2d')

    this.drawingSurface.ctx.font = '75px Cookie'
    this.textSurface.ctx.font = '75px Cookie'
    this.textSurface.ctx.strokeStyle = 'grey'
    this.drawingSurface.ctx.fillStyle = 'white'

    this.writeNewText(this.text, this.textSurface, false, true)
  },

  watch: {
    text: function (newVal, oldVal) {
      this.clearSurface()
      this.writeNewText(newVal, this.textSurface, false, true)
    },

    isScoreButtonActive: function (newVal, oldVal) {
      if (newVal === true) {
        if (this.isWordTest) {
          this.sendCanvases()
        }

        var userWritingIMG = this.drawingSurface.ctx.getImageData(0, 0, constants.canvasWidth, constants.canvasHeight)
        this.writeNewText(this.text, this.drawingSurface, true, false)

        var userMistakesIMG = this.drawingSurface.ctx.getImageData(0, 0, constants.canvasWidth, constants.canvasHeight)
        this.drawingSurface.ctx.putImageData(userWritingIMG, 0, 0)

        var textIMG = this.textSurface.ctx.getImageData(0, 0, constants.canvasWidth, constants.canvasHeight)

        var scoreData = scoreCalculator.calculateScore(userWritingIMG, userMistakesIMG, textIMG, this.time)

        this.$emit('returnScore', scoreData.score)
        this.$emit('returnAccuracy', scoreData.accuracy)
      }
    }
  },

  methods: {
    writeNewText: function (text, surface, isFilled, isCleared) {
      if (isCleared) {
        surface.ctx.clearRect(0, 0, constants.canvasWidth, constants.canvasHeight)
      }
      var words = text.split(' ')
      var line = ''
      var tempLine = ''
      var lineHeight = constants.textLineSpacing

      for (var i = 0; i < words.length; i++) {
        tempLine += (words[i] + ' ')

        if (surface.ctx.measureText(tempLine).width > (constants.canvasWidth - constants.textLeftIndent)) {
          if (isFilled) {
            surface.ctx.fillText(line, constants.textLeftIndent, lineHeight)
          } else {
            surface.ctx.strokeText(line, constants.textLeftIndent, lineHeight)
          }
          lineHeight += constants.textLineSpacing
          tempLine = words[i] + ' '
          line = words[i] + ' '
        } else {
          line = tempLine
        }
      }

      if (isFilled) {
        surface.ctx.fillText(line, constants.textLeftIndent, lineHeight)
      } else {
        surface.ctx.strokeText(line, constants.textLeftIndent, lineHeight)
      }
    },

    requestNewText: function () {
      this.$emit('requestNewText')
    },

    handleMouseDown: function (event) {
      this.isNewDrawingPath = true

      if (!this.isTimerRunning) {
        this.$emit('timer', 'start')
        this.isTimerRunning = true
      }

      this.drawingSurface.canvas.addEventListener('mousemove', this.drawOnCanvas)
    },

    handleMouseUp: function (event) {
      this.drawingSurface.canvas.removeEventListener('mousemove', this.drawOnCanvas)
    },

    handleMouseLeave: function (event) {
      this.$emit('timer', 'stop')
      this.isTimerRunning = false
    },

    toggleRubber: function (event) {
      this.isRubber = !this.isRubber
    },

    drawOnCanvas: function (event) {
      var rect = this.drawingSurface.canvas.getBoundingClientRect()
      var mouseX = Math.floor(event.clientX - rect.left)
      var mouseY = Math.floor(event.clientY - rect.top)

      if (!this.isRubber) {
        this.drawNewPoint(mouseX, mouseY)
      } else {
        this.eraseArea(mouseX, mouseY)
      }
    },

    drawNewPoint: function (mouseX, mouseY) {
      if (!this.isNewDrawingPath) {
        this.drawingSurface.ctx.beginPath()
        this.drawingSurface.ctx.moveTo(this.previousPos.x, this.previousPos.y)
        this.drawingSurface.ctx.lineTo(mouseX, mouseY)
        this.drawingSurface.ctx.strokeStyle = 'black'
        this.drawingSurface.ctx.stroke()
        this.drawingSurface.ctx.closePath()
      } else {
        this.isNewDrawingPath = false
      }
      this.previousPos = {x: mouseX, y: mouseY}
    },

    eraseArea: function (mouseX, mouseY) {
      this.drawingSurface.ctx.save()

      this.drawingSurface.ctx.beginPath()
      this.drawingSurface.ctx.moveTo(mouseX, mouseY)
      this.drawingSurface.ctx.arc(mouseX, mouseY, 10, 0, 2 * Math.PI, false)
      this.drawingSurface.ctx.closePath()

      this.drawingSurface.ctx.clip()
      this.drawingSurface.ctx.clearRect(0, 0, constants.canvasWidth, constants.canvasHeight)
      this.drawingSurface.ctx.restore()
    },

    clearSurface: function () {
      this.drawingSurface.ctx.clearRect(0, 0, constants.canvasWidth, constants.canvasHeight)
    },

    sendCanvases: function () {
      var returnVal = [
        {drawingSurface: 0}
      ]

      returnVal.drawingSurface = this.drawingSurface.canvas.toDataURL('image/png')

      this.$emit('returnCanvases', returnVal)
    }
  }
}
</script>

<style scoped>
    #drawingArea, #textArea {
      border: 3px solid #333;
      border-radius: 5px;
    }
    #drawingArea:hover, #textArea:hover {
      border-color: #4CAF50;
    }

    .buttonDiv {
      margin-left: calc(50% - 271px);
      height: 90px;
      width: 542px;
    }

    .buttonContainer {
      border-right: 1px solid black;
      display: inline-block;
      margin: 0;
      margin-left: 15px;
      height: 84px;
      width: 165px;
    }

    .buttonDiv .buttonContainer:last-child {
      border: 0;
    }

    .drawingToolsButton {
      width: 150px;
      height: 60px;
      margin-top: 12px;
      font-size: 16px;
      border: 0;
      display: block;

      color: white;
      text-align: center;
      text-decoration: none;
      background-color: #333;
    }

    .drawingToolsButton:focus {
      outline: none;
    }
    .drawingToolsButton:hover:not(.rubberButtonOnClick):not(.disabledButton) {
      background: #111;
      cursor: pointer;
    }

    .rubberButtonOnClick {
      background-color: #4CAF50;
    }

    .disabledButton {
      background-color: #999 !important;
    }

    canvas {
      font-family: 'Cookie', Helvetica, sans-serif;
      font-size: 50px;
      color:darkgray;
    }

    #textArea {
      position: absolute;
      z-index: -1;
    }
</style>
