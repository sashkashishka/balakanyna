import { Worker } from 'node:worker_threads';
import path from 'node:path';

function createWorker({ name, file }) {
  const worker = new Worker(file, { name });

  return {
    worker,
  };
}

export function fileTransport({ destinations }) {
  const { worker } = createWorker({
    file: path.resolve(import.meta.dirname, './worker.js'),
    name: 'logger-worker',
  });

  worker.postMessage({ type: 'init', destinations });

  return {
    handle(level, entity) {
      worker.postMessage({ type: 'write', level, entity });
    },
    stop() {
      return worker.terminate();
    },
  };
}
