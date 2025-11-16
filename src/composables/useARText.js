import { reactive, ref } from "vue";
import { AR_CONFIG } from "../constants/config";
import { drawText } from "../utils/canvas";

/**
 * AR 文本渲染 Composable
 */
export function useARText() {
	const renderedIndices = reactive(new Set()); // 使用 Set 追踪已渲染的字符索引
	const nextLetterIndex = ref(0);
	const shouldShowText = ref(true); // 控制是否显示文字

	// 拖动状态
	const isDragging = ref(false);
	const textPosition = reactive({ x: null, y: null }); // 文字的自定义位置（null 表示使用默认居中）
	const dragOffset = reactive({ x: 0, y: 0 }); // 拖动偏移量

	/**
	 * 处理 AR 文本生成逻辑
	 * @param {number} handX - 手部 X 坐标
	 * @param {number} handY - 手部 Y 坐标
	 * @param {number} canvasWidth - 画布宽度
	 */
	function processARLogic(handX, handY, canvasWidth) {
		// 检查是否已完成所有字符
		if (nextLetterIndex.value >= AR_CONFIG.TARGET_WORD.length) {
			return;
		}

		// 简化触发逻辑：手在屏幕左半部分触发
		const triggerCondition = handX < canvasWidth / 2;

		if (triggerCondition && !renderedIndices.has(nextLetterIndex.value)) {
			renderedIndices.add(nextLetterIndex.value);
			nextLetterIndex.value++;
		}
	}

	/**
	 * 重新绘制所有已生成的字母
	 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
	 * @param {number} canvasWidth - 画布宽度
	 * @param {number} canvasHeight - 画布高度
	 */
	function redrawLetters(ctx, canvasWidth, canvasHeight) {
		// 只有当手势为“张开”时才显示文字
		if (!shouldShowText.value) {
			return;
		}

		// 构建已渲染的完整字符串（按索引顺序）
		let displayText = "";
		for (let i = 0; i < AR_CONFIG.TARGET_WORD.length; i++) {
			// 如果该索引的字符已经被渲染，显示字符，否则不显示（用空字符串）
			displayText += renderedIndices.has(i) ? AR_CONFIG.TARGET_WORD[i] : "";
		}

		// 如果有内容，绘制文字
		if (displayText.length > 0) {
			// 如果有自定义位置，使用自定义位置；否则居中
			const textX = textPosition.x !== null ? textPosition.x : canvasWidth / 2;
			const textY = textPosition.y !== null ? textPosition.y : canvasHeight / 2;

			drawText(ctx, displayText, textX, textY, AR_CONFIG.FONT, AR_CONFIG.FONT_COLOR, "center");
		}
	}

	/**
	 * 设置文字显示状态（基于手势）
	 * @param {boolean} show - 是否显示文字
	 */
	function setTextVisibility(show) {
		shouldShowText.value = show;
	}

	/**
	 * 开始拖动
	 * @param {Object} pinchPoint - 捏合点坐标 {x, y}
	 * @param {number} canvasWidth - 画布宽度
	 * @param {number} canvasHeight - 画布高度
	 */
	function startDragging(pinchPoint, canvasWidth, canvasHeight) {
		isDragging.value = true;

		// 如果还没有自定义位置，初始化为中心位置
		if (textPosition.x === null) {
			textPosition.x = canvasWidth / 2;
			textPosition.y = canvasHeight / 2;
		}

		// 记录捏合点与文字位置的偏移量
		dragOffset.x = pinchPoint.x - textPosition.x;
		dragOffset.y = pinchPoint.y - textPosition.y;
	}

	/**
	 * 更新拖动位置
	 * @param {Object} pinchPoint - 当前捏合点坐标 {x, y}
	 */
	function updateDragging(pinchPoint) {
		if (!isDragging.value) return;

		// 根据捏合点和偏移量计算新的文字位置
		textPosition.x = pinchPoint.x - dragOffset.x;
		textPosition.y = pinchPoint.y - dragOffset.y;
	}

	/**
	 * 停止拖动
	 */
	function stopDragging() {
		isDragging.value = false;
	}

	/**
	 * 获取当前文字位置
	 * @param {number} canvasWidth - 画布宽度
	 * @param {number} canvasHeight - 画布高度
	 * @returns {Object} {x, y}
	 */
	function getTextPosition(canvasWidth, canvasHeight) {
		return {
			x: textPosition.x !== null ? textPosition.x : canvasWidth / 2,
			y: textPosition.y !== null ? textPosition.y : canvasHeight / 2,
		};
	}

	/**
	 * 获取当前显示的文字内容
	 * @returns {string}
	 */
	function getCurrentText() {
		let displayText = "";
		for (let i = 0; i < AR_CONFIG.TARGET_WORD.length; i++) {
			displayText += renderedIndices.has(i) ? AR_CONFIG.TARGET_WORD[i] : "";
		}
		return displayText;
	}

	/**
	 * Reset AR text state
	 */
	function reset() {
		renderedIndices.clear();
		nextLetterIndex.value = 0;
		isDragging.value = false;
		textPosition.x = null;
		textPosition.y = null;
		dragOffset.x = 0;
		dragOffset.y = 0;
	}

	return {
		renderedIndices,
		nextLetterIndex,
		shouldShowText,
		isDragging,
		textPosition,
		processARLogic,
		redrawLetters,
		setTextVisibility,
		startDragging,
		updateDragging,
		stopDragging,
		getTextPosition,
		getCurrentText,
		reset,
	};
}
