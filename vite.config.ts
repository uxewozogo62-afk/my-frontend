import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 字符串简写写法：
      // 将所有以 /api 开头的请求代理到 http://localhost:3005
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        // 如果你的后端接口路径里本来就有 /api，就不需要下面这行 rewrite
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})