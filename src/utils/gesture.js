/**
 * 手势识别工具函数
 */

/**
 * 计算两点之间的欧氏距离
 */
function getDistance(point1, point2) {
  const dx = point1.x - point2.x
  const dy = point1.y - point2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 判断手掌是否张开
 * @param {Array} landmarks - 手部关键点数组（21个点）
 * @returns {boolean} true 表示手掌张开，false 表示握拳
 * 
 * MediaPipe Hand Landmarks 索引：
 * 0: 手腕
 * 4: 大拇指指尖
 * 8: 食指指尖
 * 12: 中指指尖
 * 16: 无名指指尖
 * 20: 小指指尖
 */
export function isHandOpen(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return false
  }

  // 手腕作为参考点
  const wrist = landmarks[0]
  
  // 手掌中心（近似取手腕和中指根部的中点）
  const palmBase = landmarks[9]
  
  // 计算每个指尖到手掌基部的距离
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const pinkyTip = landmarks[20]
  
  // 计算各手指根部到手掌基部的距离作为基准
  const thumbBase = landmarks[2]
  const indexBase = landmarks[5]
  const middleBase = landmarks[9]
  const ringBase = landmarks[13]
  const pinkyBase = landmarks[17]
  
  // 计算指尖与指根的距离比
  const thumbRatio = getDistance(thumbTip, palmBase) / getDistance(thumbBase, palmBase)
  const indexRatio = getDistance(indexTip, palmBase) / getDistance(indexBase, palmBase)
  const middleRatio = getDistance(middleTip, palmBase) / getDistance(middleBase, palmBase)
  const ringRatio = getDistance(ringTip, palmBase) / getDistance(ringBase, palmBase)
  const pinkyRatio = getDistance(pinkyTip, palmBase) / getDistance(pinkyBase, palmBase)
  
  // 如果至少4个手指的比值大于1.5，认为手掌张开
  const extendedFingers = [
    indexRatio > 1.5,
    middleRatio > 1.5,
    ringRatio > 1.5,
    pinkyRatio > 1.5
  ].filter(Boolean).length
  
  return extendedFingers >= 3
}

/**
 * 获取当前手势状态
 * @param {Array} landmarks - 手部关键点数组
 * @returns {string} 'open' | 'closed' | 'unknown'
 */
export function getGestureState(landmarks) {
  if (!landmarks) {
    return 'unknown'
  }
  
  return isHandOpen(landmarks) ? 'open' : 'closed'
}

/**
 * 检测是否为 pinch（捏合）手势
 * @param {Array} landmarks - 手部关键点数组（归一化坐标 0-1）
 * @param {number} canvasWidth - 画布宽度（用于转换为像素坐标）
 * @param {number} canvasHeight - 画布高度
 * @param {number} threshold - 捏合阈值（像素距离）
 * @returns {Object|null} { isPinching: boolean, pinchPoint: {x, y} } 或 null
 */
export function detectPinch(landmarks, canvasWidth, canvasHeight, threshold = 40) {
  if (!landmarks || landmarks.length < 21) {
    return null
  }

  // 获取食指指尖和拇指指尖（归一化坐标）
  const indexTip = landmarks[8]
  const thumbTip = landmarks[4]

  // 转换为像素坐标（不翻转 X，保持与 drawText 的坐标系一致）
  const indexPos = {
    x: indexTip.x * canvasWidth,
    y: indexTip.y * canvasHeight
  }
  const thumbPos = {
    x: thumbTip.x * canvasWidth,
    y: thumbTip.y * canvasHeight
  }

  // 计算两指尖之间的距离
  const distance = getDistance(indexPos, thumbPos)

  // 计算捏合点（两指中点）
  const pinchPoint = {
    x: (indexPos.x + thumbPos.x) / 2,
    y: (indexPos.y + thumbPos.y) / 2
  }

  return {
    isPinching: distance < threshold,
    pinchPoint,
    distance
  }
}

/**
 * 判断点是否在文字的 bounding box 内
 * @param {Object} point - 点坐标 {x, y}
 * @param {string} text - 文字内容
 * @param {Object} textPosition - 文字位置 {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文（用于测量文字）
 * @param {string} font - 字体样式
 * @returns {boolean}
 */
export function isPointInTextBounds(point, text, textPosition, ctx, font) {
  if (!point || !text || !textPosition || !ctx) {
    return false
  }

  // 设置字体以准确测量
  ctx.save()
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 测量文字宽度和高度
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  
  // 估算文字高度（使用 actualBoundingBoxAscent + actualBoundingBoxDescent）
  const textHeight = (metrics.actualBoundingBoxAscent || 40) + 
                     (metrics.actualBoundingBoxDescent || 20)

  ctx.restore()

  // 计算 bounding box（考虑 textAlign: center 和 textBaseline: middle）
  const left = textPosition.x - textWidth / 2
  const right = textPosition.x + textWidth / 2
  const top = textPosition.y - textHeight / 2
  const bottom = textPosition.y + textHeight / 2

  // 添加一些边距，让点击区域更容易
  const padding = 20

  return (
    point.x >= left - padding &&
    point.x <= right + padding &&
    point.y >= top - padding &&
    point.y <= bottom + padding
  )
}
