# AR Hand Tracking - Vue 3 版本

## 📝 项目说明

这是一个基于 Vue 3 Composition API 和 MediaPipe HandLandmarker 的实时手部追踪 AR 应用。

### ✨ 主要特性

- ✅ **Vue 3 Composition API**：使用 `<script setup>` 语法糖
- ✅ **响应式状态管理**：使用 `ref` 和 `reactive` 管理状态
- ✅ **生命周期管理**：`onMounted` 初始化，`onUnmounted` 清理资源
- ✅ **模板引用**：使用 Vue 的 `ref` 替代 `document.getElementById`
- ✅ **实时手部追踪**：基于 MediaPipe HandLandmarker
- ✅ **AR 文本渲染**：当手部在屏幕左侧时逐字母生成"COOKING"
- ✅ **镜像视频流**：更符合自拍视角的用户体验

---

## 🗂️ 项目结构

```
gesture.git/
├── HandTracking.vue      # 主组件 - 手部追踪逻辑
├── App.vue               # 根组件
├── main.js               # Vue 应用入口
├── index-vue.html        # HTML 入口文件
├── vite.config.js        # Vite 配置
├── package.json          # 项目依赖
├── index.html            # 原始版本 (保留参考)
└── README.md             # 项目文档
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:3000`

### 3. 授权摄像头访问

首次运行时，浏览器会请求摄像头权限，请点击"允许"。

---

## 📦 依赖说明

### 核心依赖

- **vue@^3.4.0**：Vue 3 框架
- **@mediapipe/tasks-vision@^0.10.14**：MediaPipe 手部追踪库（通过 npm 安装）

### 开发依赖

- **vite@^5.0.0**：现代化构建工具
- **@vitejs/plugin-vue@^5.0.0**：Vue 3 的 Vite 插件

**注意：** MediaPipe 的 WASM 文件仍需从 CDN 加载，但核心库已通过 npm 安装。

---

## 🔧 核心重构点

### 1. **状态管理**

| 原版本（Vanilla JS） | Vue 3 版本 |
|---------------------|-----------|
| `let video = document.getElementById('video-feed')` | `const videoRef = ref(null)` |
| `let handLandmarker;` | `let handLandmarker = null` |
| `let renderedLetters = {}` | `const renderedLetters = reactive({})` |

### 2. **DOM 获取**

```vue
<!-- 模板引用 -->
<video ref="videoRef" />
<canvas ref="canvasRef" />

<!-- 使用 -->
const video = videoRef.value
const canvas = canvasRef.value
```

### 3. **生命周期**

| 原版本 | Vue 3 版本 |
|--------|-----------|
| `window.onload` / 直接执行 | `onMounted(() => {...})` |
| 无清理逻辑 | `onUnmounted(() => {...})` |

### 4. **资源清理**

```js
onUnmounted(() => {
  // 清理动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  // 停止视频流
  const video = videoRef.value
  if (video && video.srcObject) {
    const tracks = video.srcObject.getTracks()
    tracks.forEach(track => track.stop())
  }

  // 清理 HandLandmarker
  if (handLandmarker) {
    handLandmarker.close()
  }
})
```

---

## 🎯 AR 文本生成逻辑

### 触发条件

当食指指尖（landmark 索引 8）出现在屏幕**左半部分**时，逐个生成"COOKING"的字母。

### 绘制规则

- 字母水平居中排列
- 纵向居中
- 间距 80px
- 白色粗体字体（80px Arial）

### 简化说明

当前版本使用简化的触发逻辑（手在左半屏）。在实际应用中，可以：

1. 结合 YOLO 检测特定物体
2. 识别手势状态（如 "OK" 手势）
3. 定义更复杂的触发区域

---

## 🛠️ 建议的功能拆分（可选）

如果项目规模扩大，可以考虑以下拆分：

### 1. **Composables（组合式函数）**

创建 `composables/useHandTracking.js`：

```js
// 封装手部追踪逻辑
export function useHandTracking() {
  const handLandmarker = ref(null)
  const lastVideoTime = ref(-1)
  
  async function initHandLandmarker() { /* ... */ }
  
  return {
    handLandmarker,
    lastVideoTime,
    initHandLandmarker
  }
}
```

### 2. **绘制工具模块**

创建 `utils/drawing.js`：

```js
// 封装绘制函数
export function drawHandMarker(ctx, x, y) { /* ... */ }
export function drawLetters(ctx, letters, targetWord, canvasWidth, canvasHeight) { /* ... */ }
```

### 3. **AR 逻辑模块**

创建 `utils/arLogic.js`：

```js
// 封装 AR 文本生成逻辑
export class ARTextGenerator {
  constructor(targetWord) { /* ... */ }
  processFrame(handX, handY) { /* ... */ }
}
```

---

## 🐛 常见问题

### 1. 摄像头无法访问

- **原因**：浏览器安全策略要求 HTTPS 或 localhost
- **解决**：确保在 `localhost` 或配置 HTTPS（见 `vite.config.js`）

### 2. MediaPipe 加载失败

- **原因**：CDN 连接问题
- **解决**：检查网络连接或使用代理

### 3. 字母不显示

- **原因**：手部未在触发区域（左半屏）
- **解决**：将手移到屏幕左侧，确保食指指尖被识别

---

## 📊 性能优化建议

1. **帧率控制**：可以在 `predictLoop` 中添加帧率限制
2. **Canvas 离屏渲染**：对复杂绘制使用 OffscreenCanvas
3. **WebWorker**：将模型推理移到 Worker 线程（需 MediaPipe 支持）

---

## 🎨 样式自定义

在 `HandTracking.vue` 的 `<style scoped>` 中修改：

```css
/* 修改手部标记颜色 */
/* 在 drawHandMarker 函数中：ctx.fillStyle = 'blue' */

/* 修改字母样式 */
/* 在 redrawLetters 函数中：ctx.font = 'bold 100px Arial' */
```

---

## 📄 License

MIT

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📞 联系方式

如有问题，请在 GitHub Issues 中提出。
