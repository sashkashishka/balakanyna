import { Image } from 'antd';

import type { IImageEntry } from '@/types/image';
import { ImageSelectDrawer } from '@/components/ImageSelectDrawer';

interface IProps {
  value?: IImageEntry;
  onChange?(v: IImageEntry): void;
}
export function ImageField({ value, onChange }: IProps) {
  if (value) {
    return <Image width="60px" height="60px" src={value.path} />;
  }

  return <ImageSelectDrawer onSelect={onChange} />;
}
