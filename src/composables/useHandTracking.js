import { ref } from 'vue'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { MEDIAPIPE_CONFIG, HAND_MARKER_CONFIG } from '../constants/config'

/**
 * 手势识别 Composable
 */
export function useHandTracking() {
  const isLoading = ref(true)
  const loadingMessage = ref('正在加载模型,请稍候...')
  const handLandmarker = ref(null)
  const lastVideoTime = ref(-1)
  const isInitialized = ref(false)

  /**
   * 初始化 MediaPipe HandLandmarker
   */
  async function initHandLandmarker() {
    try {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_CONFIG.WASM_URL)

      handLandmarker.value = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_CONFIG.MODEL_URL
        },
        runningMode: 'VIDEO',
        numHands: MEDIAPIPE_CONFIG.NUM_HANDS
      })
      
      isInitialized.value = true
      isLoading.value = false
      return true
    } catch (error) {
      console.error('模型加载失败:', error)
      loadingMessage.value = '模型加载失败: ' + error.message
      return false
    }
  }

  /**
   * 检测手部姿态
   * @param {HTMLVideoElement} video - 视频元素
   * @returns {Object|null} 手部关键点数据
   */
  function detectHand(video) {
    if (!handLandmarker.value || !video || !isInitialized.value) return null

    const currentTime = video.currentTime
    if (lastVideoTime.value === currentTime) return null

    try {
      const startTimeMs = performance.now()
      const results = handLandmarker.value.detectForVideo(video, startTimeMs)
      lastVideoTime.value = currentTime

      if (results.handLandmarks && results.handLandmarks.length > 0) {
        return results.handLandmarks[0]
      }
    } catch (error) {
      console.error('手部检测失败:', error)
    }

    return null
  }

  /**
   * 获取食指指尖位置
   * @param {Array} landmarks - 手部关键点数组
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   * @returns {Object} {x, y} 像素坐标
   */
  function getFingerTipPosition(landmarks, canvasWidth, canvasHeight) {
    const indexFingerTip = landmarks[HAND_MARKER_CONFIG.INDEX_FINGER_TIP]
    return {
      x: indexFingerTip.x * canvasWidth,
      y: indexFingerTip.y * canvasHeight
    }
  }

  /**
   * 清理资源
   */
  function cleanup() {
    if (handLandmarker.value) {
      handLandmarker.value.close()
      handLandmarker.value = null
    }
  }

  return {
    isLoading,
    loadingMessage,
    initHandLandmarker,
    detectHand,
    getFingerTipPosition,
    cleanup
  }
}
