import { ref } from "vue";
import { CAMERA_CONFIG } from "../constants/config";

/**
 * 摄像头管理 Composable
 */
export function useCamera() {
	const videoRef = ref(null);
	const isReady = ref(false);
	const error = ref(null);

	/**
	 * 初始化摄像头
	 * @param {Function} onReady - 摄像头就绪回调
	 */
	async function setupCamera(onReady) {
		const video = videoRef.value;

		if (!video) {
			error.value = "Video element not found";
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONFIG);
			video.srcObject = stream;

			// 使用 Promise 包装 loadeddata 事件
			await new Promise((resolve) => {
				video.addEventListener(
					"loadeddata",
					() => {
						isReady.value = true;
						if (onReady) {
							onReady(video);
						}
						resolve();
					},
					{ once: true }
				);
			});
		} catch (err) {
			console.error("无法获取摄像头:", err);
			error.value = "无法获取摄像头权限";
		}
	}

	/**
	 * Stop camera
	 */
	function stopCamera() {
		const video = videoRef.value;
		if (video && video.srcObject) {
			const tracks = video.srcObject.getTracks();
			tracks.forEach((track) => track.stop());
			isReady.value = false;
		}
	}

	return {
		videoRef,
		isReady,
		error,
		setupCamera,
		stopCamera,
	};
}
