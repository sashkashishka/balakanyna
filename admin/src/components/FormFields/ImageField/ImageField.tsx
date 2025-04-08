import { Image } from 'antd';

import type { IImageEntry } from 'shared/types/image';

interface IProps {
  value?: IImageEntry;
}

export function ImageField({ value }: IProps) {
  if (!value) {
    return 'no image';
  }

  return <Image width="60px" height="60px" src={value.path} />;
}
