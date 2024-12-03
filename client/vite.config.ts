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
  };
});
