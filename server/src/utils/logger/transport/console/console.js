import { stderr, stdout } from 'node:process';

export function consoleTransport() {
  return {
    handle(level, entity) {
      switch (level) {
        case 'error':
        case 'warn': {
          return stderr.write('\n' + JSON.stringify(entity) + '\n');
        }

        case 'log':
        default: {
          return stdout.write('\n' + JSON.stringify(entity) + '\n');
        }
      }
    },
    stop() {},
  };
}
