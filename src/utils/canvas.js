/**
 * Canvas 绘制工具函数
 */

/**
 * 绘制手部标记点
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} radius - 半径
 * @param {string} color - 颜色
 */
export function drawCircle(ctx, x, y, radius, color) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

/**
 * 绘制文本
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {string} text - 文本内容
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {string} font - 字体样式
 * @param {string} color - 颜色
 * @param {string} align - 对齐方式
 */
export function drawText(ctx, text, x, y, font, color, align = 'center') {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(text, x, y)
}

/**
 * 清空画布
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 */
export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}
