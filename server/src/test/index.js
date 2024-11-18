import { spec } from 'node:test/reporters';
import { run } from 'node:test';
import process from 'node:process';
import { argv } from 'node:process';

import './helpers/setup.js';

const file = argv[2];

let options = {
  globPatterns: ['./src/test/**/*.test.js'],
};

if (file) {
  delete options.globPatterns;
  options.files = [file];
}

run({
  concurrency: 1,
  watch: !!process.env.TEST_WATCH,
  only: false,
  ...options,
})
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(spec)
  .pipe(process.stdout);
