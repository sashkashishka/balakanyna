import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '' : '/admin/',
  plugins: [
    react({
      exclude: ['client'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
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
      '/media': {
        target: 'http://localhost:4030',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:4030',
        changeOrigin: true,
      },
    },
  },
}));
