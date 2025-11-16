<template>
	<div class="hand-tracking-container">
		<!-- 加载提示 -->
		<div v-if="isLoading" class="loading">{{ loadingMessage }}</div>

		<!-- 摄像头视频流 -->
		<video ref="videoRef" class="video-feed" autoplay playsinline></video>

		<!-- AR 渲染画布 -->
		<canvas ref="canvasRef" class="overlay-canvas"></canvas>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useCamera } from "../composables/useCamera";
import { useHandTracking } from "../composables/useHandTracking";
import { useARText } from "../composables/useARText";
import { HAND_MARKER_CONFIG, GESTURE_CONFIG, AR_CONFIG, HAND_SKELETON_CONFIG } from "../constants/config";
import { drawCircle, clearCanvas, drawHandSkeleton } from "../utils/canvas";
import { getGestureState, detectPinch, isPointInTextBounds } from "../utils/gesture";

/**
 * ========================================
 * 状态管理
 * ========================================
 */

const canvasRef = ref(null);
let ctx = null;
let animationFrameId = null;

// 使用 Composables
const { videoRef, setupCamera, stopCamera } = useCamera();
const { isLoading, loadingMessage, initHandLandmarker, detectHand, getFingerTipPosition, cleanup: cleanupHandTracking } = useHandTracking();
const { 
	processARLogic, 
	redrawLetters, 
	setTextVisibility, 
	shouldShowText,
	isDragging,
	startDragging,
	updateDragging,
	stopDragging,
	getTextPosition,
	getCurrentText
} = useARText();

/**
 * ========================================
 * 核心逻辑
 * ========================================
 */

/**
 * 实时预测和渲染循环
 */
let frameCount = 0;
let lastLogTime = 0;

function renderLoop() {
	const video = videoRef.value;
	const canvas = canvasRef.value;

	if (!video || !canvas || !ctx) {
		animationFrameId = requestAnimationFrame(renderLoop);
		return;
	}

	frameCount++;

	// 获取 Canvas 的 CSS 显示尺寸作为逻辑坐标系
	const rect = canvas.getBoundingClientRect();
	const displayWidth = rect.width;
	const displayHeight = rect.height;

	// 检测手部姿态
	const landmarks = detectHand(video);

	// 清空画布（使用内部像素尺寸）
	clearCanvas(ctx, canvas.width, canvas.height);

	if (landmarks) {
		// 判断手势状态
		const gestureState = getGestureState(landmarks);

		// 根据手势控制文字显示：张开手掌显示，握拳隐藏
		setTextVisibility(gestureState === "open");

		// 检测 pinch 手势
		const pinchResult = detectPinch(
			landmarks, 
			displayWidth, 
			displayHeight, 
			GESTURE_CONFIG.PINCH_THRESHOLD
		);

		// 处理拖动逻辑
		if (pinchResult && shouldShowText.value) {
			if (pinchResult.isPinching) {
				// 如果还未开始拖动，检查捏合点是否在文字区域内
				if (!isDragging.value) {
					const currentText = getCurrentText();
					if (currentText.length > 0) {
						const textPos = getTextPosition(displayWidth, displayHeight);
						const isInBounds = isPointInTextBounds(
							pinchResult.pinchPoint,
							currentText,
							textPos,
							ctx,
							AR_CONFIG.FONT
						);

						if (isInBounds) {
							startDragging(pinchResult.pinchPoint, displayWidth, displayHeight);
						}
					}
				} else {
					// 已经在拖动中，持续更新位置
					updateDragging(pinchResult.pinchPoint);
				}
			} else {
				// 捏合松开，停止拖动
				if (isDragging.value) {
					stopDragging();
				}
			}
		}

		// 绘制手部骨架（关键点 + 连接线）
		drawHandSkeleton(ctx, landmarks, displayWidth, displayHeight, HAND_SKELETON_CONFIG);

		// 获取食指指尖位置（使用显示尺寸）
		const { x, y } = getFingerTipPosition(landmarks, displayWidth, displayHeight);

		// 绘制手部标记（可选，如果不需要额外的红色点可以注释）
		// drawCircle(ctx, x, y, HAND_MARKER_CONFIG.RADIUS, HAND_MARKER_CONFIG.COLOR);

		// 处理 AR 文本逻辑（只有在不拖动时才触发生成）
		if (!isDragging.value) {
			processARLogic(x, y, displayWidth);
		}
	}

	// 重新绘制已生成的字母（使用显示尺寸）
	redrawLetters(ctx, displayWidth, displayHeight);

	animationFrameId = requestAnimationFrame(renderLoop);
}

/**
 * 摄像头就绪回调
 */
function onCameraReady(video) {
	const canvas = canvasRef.value;
	if (!canvas) return;

	// 获取 Canvas 的 CSS 显示尺寸（视口尺寸）
	const rect = canvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;

	// 设置 Canvas 内部高分辨率（避免模糊）
	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;

	// 缩放绘制坐标系以匹配高分辨率
	if (ctx) {
		ctx.scale(dpr, dpr);
	}

	// 开始播放和渲染
	video.play();
	renderLoop();
}

/**
 * ========================================
 * 生命周期
 * ========================================
 */

onMounted(async () => {
	// 初始化 Canvas 上下文
	ctx = canvasRef.value?.getContext("2d");
	if (!ctx) {
		console.error("无法获取 Canvas 上下文");
		return;
	}

	// 初始化手势识别模型
	const success = await initHandLandmarker();
	if (!success) {
		console.error("模型加载失败");
		return;
	}

	// 初始化摄像头
	await setupCamera(onCameraReady);
});

onUnmounted(() => {
	// 清理动画帧
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
	}

	// 停止摄像头
	stopCamera();

	// 清理手势识别资源
	cleanupHandTracking();
});
</script>

<style scoped>
.hand-tracking-container {
	position: relative;
	width: 100vw;
	height: 100vh;
	margin: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #222;
	overflow: hidden;
}

.video-feed {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	transform: scaleX(-1);
}

.overlay-canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	transform: scaleX(-1);
}

.loading {
	color: white;
	font-size: 24px;
	z-index: 10;
	position: relative;
}

.help-text {
	position: absolute;
	top: 20px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 10;
	background: rgba(0, 0, 0, 0.7);
	padding: 15px 25px;
	border-radius: 10px;
	text-align: center;
}

.help-text p {
	color: white;
	font-size: 16px;
	margin: 5px 0;
}
</style>
