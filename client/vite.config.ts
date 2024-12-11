import path from 'node:path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig(({ mode }) => {
  if (mode === 'build-lib') {
    return {
      plugins: [
        solid(),
        externalizeDeps({
          except: ['swiper'],
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(import.meta.dirname, './src'),
        },
      },
      build: {
        outDir: 'lib',
        lib: {
          entry: path.resolve(import.meta.dirname, './src/tasks/index.ts'),
          formats: ['es'],
        },
      },
    };
  }

  return {
    plugins: [solid()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
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
  };
});
