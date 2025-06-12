import path from 'node:path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { sentryVitePlugin } from '@sentry/vite-plugin';

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
    build: {
      sourcemap: mode === 'production',
    },
    plugins: [
      solid(),
      sentryVitePlugin({
        org: process.env.VITE_SENTRY_ORG,
        project: process.env.VITE_SENTRY_PROJECT,
        authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
        release: {
          name: process.env.VITE_CLIENT_VERSION,
        },
      }),
    ],
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
