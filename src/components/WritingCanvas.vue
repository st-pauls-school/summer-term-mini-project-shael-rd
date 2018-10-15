<template>
    <div>
        <canvas
          id="textArea"
          width="500" height="300">
        </canvas>
        <canvas
          id="drawingArea"
          width="500" height="300"
          v-on:mousedown="toggleEventOn"
          v-on:mouseup="toggleEventOff">
        </canvas>
        <div class="buttonDiv">
            <div class='buttonContainer'>
                <button
                  class="drawingToolsButton"
                  v-bind:class="{rubberButtonOnClick: rubber === true}"
                  v-on:click="toggleRubber">
                    Rubber
                </button><!--
         --></div><!--
         --><div class='buttonContainer'><!--
             --><button
                  class="drawingToolsButton"
                  v-on:click="clearCanvas">
                    Clear
                </button><!--
         --></div><!--
         --><div class='buttonContainer'><!--
             --><button
                  class="drawingToolsButton"
                  v-on:click="requestNewText">
                    Refresh
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'WritingCanvas',

  props: {
    text: String
  },

  data () {
    return {
      previousPos: 0,
      newMousePress: true,
      rubber: false,
      canvas: 0,
      ctx: 0,
      textCanvas: 0,
      textctx: 0
    }
  },

  mounted () {
    this.canvas = document.getElementById('drawingArea')
    this.ctx = this.canvas.getContext('2d')

    this.textCanvas = document.getElementById('textArea')
    this.textctx = this.textCanvas.getContext('2d')
    this.textctx.font = '100px Cookie'
  },

  watch: {
    text: function (newVal, oldVal) {
      this.clearCanvas()
      this.textctx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height)
      this.textctx.strokeText(newVal, 30, 200)
    }
  },

  methods: {
    requestNewText: function () {
      this.$emit('requestNewText')
    },

    toggleEventOn: function (event) {
      this.newMousePress = true
      this.canvas.addEventListener('mousemove', this.drawOnCanvas)
    },

    toggleEventOff: function (event) {
      this.canvas.removeEventListener('mousemove', this.drawOnCanvas)
    },

    toggleRubber: function (event) {
      this.rubber = !this.rubber
    },

    drawOnCanvas: function (event) {
      var rect = this.canvas.getBoundingClientRect()
      var mouseX = Math.floor(event.clientX - rect.left)
      var mouseY = Math.floor(event.clientY - rect.top)

      if (!this.rubber) {
        this.drawNewPoint(mouseX, mouseY)
      } else {
        this.eraseArea(mouseX, mouseY)
      }
    },

    drawNewPoint: function (mouseX, mouseY) {
      if (this.newMousePress === false) {
        this.ctx.beginPath()
        this.ctx.moveTo(this.previousPos.x, this.previousPos.y)
        this.ctx.lineTo(mouseX, mouseY)
        this.ctx.strokeStyle = 'black'
        this.ctx.stroke()
        this.ctx.closePath()
      } else {
        this.newMousePress = false
      }
      this.previousPos = {x: mouseX, y: mouseY}
    },

    eraseArea: function (mouseX, mouseY) {
      this.ctx.save()

      this.ctx.beginPath()
      this.ctx.moveTo(mouseX, mouseY)
      this.ctx.arc(mouseX, mouseY, 10, 0, 2 * Math.PI, false)
      this.ctx.closePath()

      this.ctx.clip()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.restore()
    },

    clearCanvas: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }
}
</script>

<style scoped>
    #drawingArea {
      border: 3px solid #333;
      border-radius: 5px;
    }
    #drawingArea:hover {
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
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      background-color: #333;
    }

    .drawingToolsButton:focus {
      outline: none;
    }
    .drawingToolsButton:hover:not(.rubberButtonOnClick) {
      background: #111;
    }

    .rubberButtonOnClick {
      background-color: #4CAF50;
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
