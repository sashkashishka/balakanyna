import { parentPort } from 'node:worker_threads';
import fs from 'node:fs';

/**
 * @type {Array<{ stream: fs.WriteStream; level: TLevel }} dest
 */
let dest = undefined;

const handlers = {
  init({ destinations }) {
    dest = createWriteFileDescriptors(destinations);
  },
  write({ level, entity }) {
    dest.forEach((d) => {
      if (d.level !== level && d.level !== 'all') return;

      d.stream.write(JSON.stringify(entity) + '\n');
    });
  },
};

parentPort.on('message', (msg) => {
  const handler = handlers[msg.type];
  if (handler) handler(msg);
});

function createWriteFileDescriptors(destinations) {
  return destinations.map((dest) => {
    const stream = fs.createWriteStream(dest.file, { flags: 'a' });

    dest.stream = stream;

    return dest;
  });
}
