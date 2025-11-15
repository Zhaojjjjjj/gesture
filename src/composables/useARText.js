import { reactive, ref } from 'vue'
import { AR_CONFIG } from '../constants/config'
import { drawText } from '../utils/canvas'

/**
 * AR 文本渲染 Composable
 */
export function useARText() {
  const renderedLetters = reactive({})
  const nextLetterIndex = ref(0)

  /**
   * 处理 AR 文本生成逻辑
   * @param {number} handX - 手部 X 坐标
   * @param {number} handY - 手部 Y 坐标
   * @param {number} canvasWidth - 画布宽度
   */
  function processARLogic(handX, handY, canvasWidth) {
    const nextLetter = AR_CONFIG.TARGET_WORD[nextLetterIndex.value]

    if (!nextLetter) {
      return // 单词已完成
    }

    // 简化触发逻辑：手在屏幕左半部分触发
    const triggerCondition = handX < canvasWidth / 2

    if (triggerCondition && !renderedLetters[nextLetter]) {
      renderedLetters[nextLetter] = {
        x: handX,
        y: handY - AR_CONFIG.LETTER_OFFSET_Y,
        text: nextLetter
      }
      nextLetterIndex.value++
    }
  }

  /**
   * 重新绘制所有已生成的字母
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  function redrawLetters(ctx, canvasWidth, canvasHeight) {
    const textCenterY = canvasHeight / 2
    const textStartX = canvasWidth / 2 - (AR_CONFIG.TARGET_WORD.length * AR_CONFIG.LETTER_WIDTH) / 2

    Object.values(renderedLetters).forEach((letter) => {
      const order = AR_CONFIG.TARGET_WORD.indexOf(letter.text)
      if (order >= 0) {
        const currentX = textStartX + order * AR_CONFIG.LETTER_SPACING
        drawText(
          ctx,
          letter.text,
          currentX,
          textCenterY,
          AR_CONFIG.FONT,
          AR_CONFIG.FONT_COLOR
        )
      }
    })
  }

  /**
   * 重置 AR 文本状态
   */
  function reset() {
    Object.keys(renderedLetters).forEach(key => {
      delete renderedLetters[key]
    })
    nextLetterIndex.value = 0
  }

  return {
    renderedLetters,
    nextLetterIndex,
    processARLogic,
    redrawLetters,
    reset
  }
}
