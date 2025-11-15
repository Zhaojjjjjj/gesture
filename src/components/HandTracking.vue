<template>
  <div class="hand-tracking-container">
    <!-- 加载提示 -->
    <div v-if="isLoading" class="loading">{{ loadingMessage }}</div>
    
    <!-- 摄像头视频流 -->
    <video 
      ref="videoRef" 
      class="video-feed" 
      autoplay 
      playsinline
    ></video>
    
    <!-- AR 渲染画布 -->
    <canvas 
      ref="canvasRef" 
      class="overlay-canvas"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCamera } from '../composables/useCamera'
import { useHandTracking } from '../composables/useHandTracking'
import { useARText } from '../composables/useARText'
import { HAND_MARKER_CONFIG } from '../constants/config'
import { drawCircle, clearCanvas } from '../utils/canvas'

/**
 * ========================================
 * 状态管理
 * ========================================
 */

const canvasRef = ref(null)
let ctx = null
let animationFrameId = null

// 使用 Composables
const { videoRef, setupCamera, stopCamera } = useCamera()
const { 
  isLoading, 
  loadingMessage, 
  initHandLandmarker, 
  detectHand, 
  getFingerTipPosition,
  cleanup: cleanupHandTracking 
} = useHandTracking()
const { processARLogic, redrawLetters } = useARText()

/**
 * ========================================
 * 核心逻辑
 * ========================================
 */

/**
 * 实时预测和渲染循环
 */
function renderLoop() {
  const video = videoRef.value
  const canvas = canvasRef.value

  if (!video || !canvas || !ctx) {
    animationFrameId = requestAnimationFrame(renderLoop)
    return
  }

  // 检测手部姿态
  const landmarks = detectHand(video)

  // 清空画布
  clearCanvas(ctx, canvas.width, canvas.height)

  if (landmarks) {
    // 获取食指指尖位置
    const { x, y } = getFingerTipPosition(landmarks, canvas.width, canvas.height)

    // 绘制手部标记
    drawCircle(ctx, x, y, HAND_MARKER_CONFIG.RADIUS, HAND_MARKER_CONFIG.COLOR)

    // 处理 AR 文本逻辑
    processARLogic(x, y, canvas.width)
  }

  // 重新绘制已生成的字母
  redrawLetters(ctx, canvas.width, canvas.height)

  animationFrameId = requestAnimationFrame(renderLoop)
}

/**
 * 摄像头就绪回调
 */
function onCameraReady(video) {
  const canvas = canvasRef.value
  if (!canvas) return

  // 设置画布尺寸与视频一致
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 开始播放和渲染
  video.play()
  renderLoop()
}

/**
 * ========================================
 * 生命周期
 * ========================================
 */

onMounted(async () => {
  // 初始化 Canvas 上下文
  ctx = canvasRef.value?.getContext('2d')
  if (!ctx) {
    console.error('无法获取 Canvas 上下文')
    return
  }

  // 初始化手势识别模型
  const success = await initHandLandmarker()
  if (!success) return

  // 初始化摄像头
  await setupCamera(onCameraReady)
})

onUnmounted(() => {
  // 清理动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  // 停止摄像头
  stopCamera()

  // 清理手势识别资源
  cleanupHandTracking()
})
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
  transform: scaleX(-1);
}

.loading {
  color: white;
  font-size: 24px;
  z-index: 10;
  position: relative;
}
</style>
