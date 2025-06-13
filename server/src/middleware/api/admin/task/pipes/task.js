import { pipe } from '../../../../../utils/pipe.js';
import { createValidateFullConfig } from './config.js';
import { addImagePrefixInTaskConfig, populateImage } from './image.js';

function castLabelMapToArray(task) {
  task.labels = [...task.labels.values()];

  return task;
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
export function createTransformTask(ctx) {
  const misc = pipe(
    castLabelMapToArray,
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
          hash: curr.hash,
          name: curr.name,
          type: curr.type,
          config: curr.config,
          createdAt: curr.createdAt,
          updatedAt: curr.updatedAt,
          labels: new Map(),
          images: [],
        });
      }

      if (curr.label) {
        acc.get(id).labels.set(curr.label.id, curr.label);
      }

      if (curr.image) {
        acc.get(id).images.push(curr.image);
      }

      return acc;
    }, new Map());

    return [...itemsMap.values()].map(misc);
  };
}
