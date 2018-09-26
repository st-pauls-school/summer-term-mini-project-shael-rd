<template>
    <div>
        <canvas width="300" height="150" style="border:1px solid #BBB;" v-on: v-drawToCanvas></canvas>
    </div>
</template>

<script>
export default {
  name: 'WritingCanvas',

  data () {
    return {
      selectedOption: 0
    }
  },

  methods: {
    canvasMousedOver: function 

    }
  },

  directives () {
    drawToCanvas: {

    }
  }
}
</script>