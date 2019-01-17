import {constants} from '@/constants.js'

function writeNewText (text, surface, isFilled, isCleared) {
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
}

export default {
  writeNewText
}
