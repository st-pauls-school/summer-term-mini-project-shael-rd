function calculateScore (canvasImage, whiteTextImage, outlineImage, time) {
  var pixelCount = 0
  var pixelError = 0
  var pixelOutline = 0

  /* console.log('canvas data length: ', canvasImage.data.length)
  console.log('canvasImage.data[0]: ', canvasImage.data[0])
  console.log('canvasImage.data[1]: ', canvasImage.data[1])
  console.log('canvasImage.data[2]: ', canvasImage.data[2])
  console.log('canvasImage.data[3]: ', canvasImage.data[3]) */

  for (var i = 0; i < canvasImage.data.length; i += 4) {
    var exists = canvasImage.data[i] + canvasImage.data[i + 1] + canvasImage.data[i + 2]
    if (exists < 765 && canvasImage.data[i + 3] > 0) {
      pixelCount++
    }
    exists = whiteTextImage.data[i] + whiteTextImage.data[i + 1] + whiteTextImage.data[i + 2]
    if (exists < 765 && whiteTextImage.data[i + 3] > 0) {
      pixelError++
    }
    exists = outlineImage.data[i] + outlineImage.data[i + 1] + outlineImage.data[i + 2]
    if (exists < 765 && outlineImage.data[i + 3] > 0) {
      pixelOutline++
    }
  }

  /* console.log('PixelCount: ', pixelCount)
  console.log('PixelError: ', pixelError)
  console.log('PixelOutline: ', pixelOutline) */

  var textFillLevel = 0
  if ((pixelCount - pixelError) > pixelOutline) {
    textFillLevel = 1
  } else {
    textFillLevel = (pixelCount - pixelError) / pixelOutline
  }

  var accuracy = 1 - (pixelError / pixelCount)

  var pixelsPerSecond = (pixelCount - pixelError) / time

  var score = pixelsPerSecond * accuracy * textFillLevel

  /* console.log('textFillLevel: ', textFillLevel)
  console.log('accuracy: ', accuracy)
  console.log('pixelsPerSecond: ', pixelsPerSecond)
  console.log('score: ', score) */

  return score.toFixed(2)
}

export default {
  calculateScore
}
