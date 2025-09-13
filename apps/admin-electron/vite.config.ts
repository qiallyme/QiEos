import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src/renderer'),
    },
  },
  server: {
    port: 5173,
  },
});
