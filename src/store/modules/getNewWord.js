import {constants} from '@/constants.js'

function getNewWord (vm) {
  var http = new XMLHttpRequest()
  var serverResponse = ''

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
}

export default {
  getNewWord
}
