import { ref } from "vue";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { MEDIAPIPE_CONFIG, HAND_MARKER_CONFIG } from "../constants/config";

/**
 * 手势识别 Composable
 */
export function useHandTracking() {
	const isLoading = ref(true);
	const loadingMessage = ref("Loading model, please wait...");
	const handLandmarker = ref(null);
	const lastVideoTime = ref(-1);
	const isInitialized = ref(false);
	let lastDetectionTime = 0;

	/**
	 * 初始化 MediaPipe HandLandmarker
	 */
	async function initHandLandmarker() {
		try {
			// 使用与安装版本匹配的 WASM（0.10.0 更稳定）
			const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");

			// 直接创建 VIDEO 模式（runningMode 创建后不可更改）
			handLandmarker.value = await HandLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
					delegate: "GPU",
				},
				runningMode: "VIDEO",
				numHands: 2, // 检测最多2只手
				minHandDetectionConfidence: 0.3, // 降低检测阈值（默认0.5）
				minHandPresenceConfidence: 0.3, // 降低存在阈值（默认0.5）
				minTrackingConfidence: 0.3, // 降低追踪阈值（默认0.5）
			});

			isInitialized.value = true;
			isLoading.value = false;
			return true;
		} catch (error) {
			console.error("模型加载失败:", error);
			loadingMessage.value = "模型加载失败: " + error.message;
			return false;
		}
	}

	/**
	 * 检测手部姿态
	 * @param {HTMLVideoElement} video - 视频元素
	 * @returns {Object|null} 手部关键点数据
	 */
	function detectHand(video) {
		if (!handLandmarker.value || !video || !isInitialized.value) {
			return null;
		}

		// 确保视频已经开始播放且有有效的时间戳
		if (video.readyState < 2 || video.currentTime <= 0) {
			return null;
		}

		const currentTime = video.currentTime;

		// 跳过相同时间戳的帧
		if (lastVideoTime.value === currentTime) {
			return null;
		}

		try {
			// 使用 Date.now() 作为时间戳，确保单调递增
			const nowMs = Date.now();

			// 确保时间戳递增（至少间隔 1ms）
			if (nowMs <= lastDetectionTime) {
				return null;
			}
			lastDetectionTime = nowMs;

			const results = handLandmarker.value.detectForVideo(video, nowMs);
			lastVideoTime.value = currentTime;

			// 尝试从 landmarks 或 handLandmarks 获取数据
			const hands = results?.landmarks || results?.handLandmarks || results?.worldLandmarks;

			if (hands && hands.length > 0) {
				return hands[0];
			}
		} catch (error) {
			console.error("❌ 检测过程出错:", error);
		}

		return null;
	}

	/**
	 * 获取食指指尖位置
	 * @param {Array} landmarks - 手部关键点数组
	 * @param {number} canvasWidth - 画布宽度
	 * @param {number} canvasHeight - 画布高度
	 * @returns {Object} {x, y} 像素坐标
	 */
	function getFingerTipPosition(landmarks, canvasWidth, canvasHeight) {
		const indexFingerTip = landmarks[HAND_MARKER_CONFIG.INDEX_FINGER_TIP];
		return {
			// 翻转 X 坐标以匹配镜像后的视频
			x: (1 - indexFingerTip.x) * canvasWidth,
			y: indexFingerTip.y * canvasHeight,
		};
	}

	/**
	 * 清理资源
	 */
	function cleanup() {
		if (handLandmarker.value) {
			handLandmarker.value.close();
			handLandmarker.value = null;
		}
	}

	return {
		isLoading,
		loadingMessage,
		initHandLandmarker,
		detectHand,
		getFingerTipPosition,
		cleanup,
	};
}
