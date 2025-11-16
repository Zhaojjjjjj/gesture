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
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
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
export function drawText(ctx, text, x, y, font, color, align = "center") {
	ctx.save(); // 保存当前状态
	
	// 因为 canvas 被 CSS transform: scaleX(-1) 镜像了
	// 需要在绘制文字时反向镜像回来，让文字正常显示
	ctx.scale(-1, 1);
	
	ctx.font = font;
	ctx.fillStyle = color;
	ctx.textAlign = align;
	ctx.textBaseline = "middle"; // 垂直居中对齐
	
	// X 坐标取反以配合 scale(-1, 1)
	ctx.fillText(text, -x, y);
	
	ctx.restore(); // 恢复状态
}

/**
 * 绘制线段
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} x1 - 起点 X 坐标
 * @param {number} y1 - 起点 Y 坐标
 * @param {number} x2 - 终点 X 坐标
 * @param {number} y2 - 终点 Y 坐标
 * @param {string} color - 线条颜色
 * @param {number} width - 线条宽度
 */
export function drawLine(ctx, x1, y1, x2, y2, color, width = 2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.stroke();
	ctx.closePath();
}

/**
 * 绘制手部骨架（关键点 + 连接线）
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Array} landmarks - 手部关键点数组（21个点，归一化坐标 0-1）
 * @param {number} canvasWidth - 画布显示宽度
 * @param {number} canvasHeight - 画布显示高度
 * @param {Object} config - 骨架配置对象
 */
export function drawHandSkeleton(ctx, landmarks, canvasWidth, canvasHeight, config) {
	if (!landmarks || landmarks.length < 21) {
		return;
	}

	// 将归一化坐标转换为像素坐标
	const points = landmarks.map(landmark => ({
		x: landmark.x * canvasWidth,
		y: landmark.y * canvasHeight
	}));

	// 1. 先绘制连接线（在关键点下层）
	config.CONNECTIONS.forEach(([start, end]) => {
		if (points[start] && points[end]) {
			drawLine(
				ctx,
				points[start].x,
				points[start].y,
				points[end].x,
				points[end].y,
				config.LINE_COLOR,
				config.LINE_WIDTH
			);
		}
	});

	// 2. 绘制关键点（在连接线上层）
	points.forEach(point => {
		drawCircle(
			ctx,
			point.x,
			point.y,
			config.POINT_RADIUS,
			config.POINT_COLOR
		);
	});
}

/**
 * 清空画布
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 */
export function clearCanvas(ctx, width, height) {
	ctx.clearRect(0, 0, width, height);
}
