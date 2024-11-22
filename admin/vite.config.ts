import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': './src',
    },
  },
  build: {
    outDir: 'build',
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4030',
        changeOrigin: true,
      },
    },
  },
});
