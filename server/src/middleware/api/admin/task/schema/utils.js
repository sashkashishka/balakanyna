import { addPrefixToPathname } from '../../../../../utils/network.js';

export function addImagePrefixInTaskConfig(type, config, prefix) {
  switch (type) {
    case 'imageSlider': {
      config.slides = config.slides.map(({ image }) => ({
        image: {
          ...image,
          path: addPrefixToPathname(image.path, prefix),
        },
      }));

      return config;
    }

    default:
      return config;
  }
}
