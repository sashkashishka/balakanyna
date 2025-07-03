import { addPrefixToPathname } from '../../../../../utils/network.js';

export function getUniqueImageIds(task) {
  switch (task.type) {
    case 'imageSlider': {
      return [...new Set(task.config.slides.map(({ image }) => image.id))];
    }

    case 'brainbox': {
      return [
        ...new Set(
          task.config.items.reduce((acc, { front, back }) => {
            acc.push(front.id);
            acc.push(back.id);

            return acc;
          }, []),
        ),
      ];
    }

    default:
      return [];
  }
}

export function populateImage(task) {
  switch (task.type) {
    case 'imageSlider': {
      task.config.slides = task.config.slides
        .map(({ image }) => ({
          image: task.images.find((fullImg) => fullImg.id === image.id),
        }))
        .filter(({ image }) => image);

      delete task.images;

      return task;
    }

    case 'brainbox': {
      task.config.items = task.config.items.map(({ front, back }) => ({
        front: task.images.find((fullImg) => fullImg.id === front.id) || {},
        back: task.images.find((fullImg) => fullImg.id === back.id) || {},
      }));

      delete task.images;

      return task;
    }

    default:
      delete task.images;
      return task;
  }
}

export function addImagePrefixInTaskConfig(prefix) {
  return function addPrefix(task) {
    switch (task.type) {
      case 'imageSlider': {
        task.config.slides = task.config.slides.map(({ image }) => ({
          image: {
            ...image,
            path: addPrefixToPathname(image?.path, prefix),
          },
        }));

        return task;
      }

      case 'brainbox': {
        task.config.items = task.config.items.map(({ front, back }) => ({
          front: {
            ...front,
            path: front.path ? addPrefixToPathname(front.path, prefix) : undefined,
          },
          back: {
            ...back,
            path: back.path ? addPrefixToPathname(back.path, prefix) : undefined,
          },
        }));

        return task;
      }

      default:
        return task;
    }
  };
}
