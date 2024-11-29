import { addPrefixToPathname } from '../../../../../utils/network.js';

export function getImageIds(task) {
  switch (task.type) {
    case 'imageSlider': {
      return task.config.slides.map(({ image }) => image.id);
    }

    default:
      return [];
  }
}

export function addImagePrefixInTaskConfig(prefix) {
  return function addPrefix(task) {
    switch (task.type) {
      case 'imageSlider': {
        task.config.slides = task.config.slides.map(({ image }) => ({
          image: {
            ...image,
            path: addPrefixToPathname(image.path, prefix),
          },
        }));

        return task;
      }

      default:
        return task;
    }
  };
}
