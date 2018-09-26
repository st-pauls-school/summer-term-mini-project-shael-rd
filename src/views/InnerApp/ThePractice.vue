<template>
    <div>
      <WritingCanvas/>
    </div>
</template>

<script>
import WritingCanvas from '@/components/WritingCanvas'

export default {
  name: 'ThePractice',
  components: {
    WritingCanvas
  },

  data () {
    return {
      selectedOption: 0
    }
  }
}
</script>
