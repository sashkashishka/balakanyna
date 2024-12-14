import fsp from 'node:fs/promises';

export async function safeFileRm(file, logger = () => void 0) {
  try {
    await fsp.rm(file);

    return true;
  } catch (err) {
    logger({ err, place: 'safeFileRm' });
    return false;
  }
}
