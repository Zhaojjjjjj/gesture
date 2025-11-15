import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    https: false, // 如果需要 HTTPS 访问摄像头，可以设置为 true
    port: 3000,
    open: true
  }
})
