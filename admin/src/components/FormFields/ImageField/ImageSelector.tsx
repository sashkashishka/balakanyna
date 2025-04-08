import { type FormInstance } from 'antd';

import { ImageSelectDrawer } from '@/components/ImageSelectDrawer';

interface IProps {
  name: string | string[];
  form: FormInstance;
  itemPrefix?: string;
}

export function ImageSelector({ name, itemPrefix, form }: IProps) {
  return (
    <ImageSelectDrawer
      onSelect={(images) => {
        const currValue = form.getFieldValue(name) || [];

        form.setFieldValue(
          name,
          currValue.concat(
            images.map((image) => {
              if (itemPrefix) {
                return { [itemPrefix]: image };
              }
              return image;
            }),
          ),
        );
      }}
    />
  );
}
