import path from 'node:path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
  if (mode === 'build-lib') {
    return {
      plugins: [solid()],
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
