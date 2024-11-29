import { pipe } from '../../../../../utils/pipe.js';
import { createValidateFullConfig } from './config.js';
import { addImagePrefixInTaskConfig, populateImage } from './image.js';

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
export function createTransformTask(ctx) {
  const misc = pipe(
    populateImage,
    addImagePrefixInTaskConfig(ctx.config.media.prefix),
    createValidateFullConfig(ctx),
  );

  return function transformTaskPipe(result) {
    const itemsMap = result.reduce((acc, curr) => {
      const { id } = curr;

      if (!acc.has(id)) {
        acc.set(id, {
          id,
          name: curr.name,
          type: curr.type,
          config: curr.config,
          createdAt: curr.createdAt,
          updatedAt: curr.updatedAt,
          labels: [],
          images: [],
        });
      }

      if (curr.label) {
        acc.get(id).labels.push(curr.label);
      }

      if (curr.image) {
        acc.get(id).images.push(curr.image);
      }

      return acc;
    }, new Map());

    return [...itemsMap.values()].map(misc);
  };
}
