/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'node:path';

const DEFAULT_NOT_FOUND = path.resolve(import.meta.dirname, './notFound.html');

async function checkFile(filePath, fsStat) {
  try {
    const a = await fsStat(filePath);

    return true;
  } catch (e) {
    return false;
  }
}

export async function getFilePath({ file, prefix, dir, notFound, fsStat }) {
  const filePath = path.join(dir, file.replace(prefix, ''));
  const indexPath = path.join(dir, 'index.html');
  const { name, ext } = path.parse(filePath);

  const getFallbackPath = async () =>
    notFound === 'index' && (await checkFile(indexPath, fsStat))
      ? indexPath
      : DEFAULT_NOT_FOUND;

  if (name.startsWith('.')) {
    return {
      filePath: await getFallbackPath(),
      code: 404,
    };
  }

  if (ext === '') {
    return {
      filePath: await getFallbackPath(),
      code: 200,
    };
  }

  try {
    await fsStat(filePath);

    return { filePath, code: 200 };
  } catch (e) {
    return { filePath: await getFallbackPath(), code: 404 };
  }
}
