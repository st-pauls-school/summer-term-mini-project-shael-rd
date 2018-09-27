<template>
    <div>
        <canvas id="DrawingArea" width="300" height="150" style="border:1px solid #BBB;" v-on:mousemove="mouseIsDown ? mouseOnCanvas : 0"></canvas>
        <h1>{{curLocation}}</h1>
    </div>
</template>

<script>
export default {
  name: 'WritingCanvas',

  data () {
    return {
      points: [],
      pointsCounter: 0,
      mouseIsDown: false,
      curLocation: ''
    }
  },

  methods: {
    mouseOnCanvas: function (event) {
      var canvas = document.getElementById('DrawingArea')
      var ctx = canvas.getContext('2d')
      var rect = canvas.getBoundingClientRect()
      var mouseX = Math.floor(event.clientX - rect.left)
      var mouseY = Math.floor(event.clientY - rect.top)

      this.points.push({x: mouseX, y: mouseY})
      if (this.pointsCounter > 0) {
        ctx.moveTo(this.points[this.pointsCounter - 1].x, this.points[this.pointsCounter - 1].y)
        ctx.lineTo(this.points[this.pointsCounter].x, this.points[this.pointsCounter].y)
        ctx.stroke()
      }
      this.pointsCounter++

      this.curLocation = ''
      this.curLocation += 'X: '
      this.curLocation += event.clientX - rect.left
      this.curLocation += ' Y: '
      this.curLocation += event.clientY - rect.top
    }
  },

  events: {
    mouseIsPressed: function () {
      console.log('oof1')
      this.mouseIsDown = true
    },
    mouseIsNotPressed: function () {
      console.log('oof2')
      this.mouseIsDown = false
    }
  }
}
</script>
