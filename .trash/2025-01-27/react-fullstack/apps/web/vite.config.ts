import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, '../../packages/ui/components'),
      '@/lib': path.resolve(__dirname, '../../packages/ui/lib'),
      '@/hooks': path.resolve(__dirname, '../../packages/ui/hooks'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
})
