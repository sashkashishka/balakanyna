import { addPrefixToPathname } from '../../../../../utils/network.js';

export function getUniqueImageIds(task) {
  switch (task.type) {
    case 'imageSlider': {
      return [...new Set(task.config.slides.map(({ image }) => image.id))];
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

      default:
        return task;
    }
  };
}
