import { type FormInstance } from 'antd';

import { ImageSelectDrawer } from '@/components/ImageSelectDrawer';

interface IProps {
  name: string | string[];
  multipleSelect?: boolean;
  normalize?(v: unknown): unknown;
  form: FormInstance;
  itemPrefix?: string;
}

function identity<T>(x: T) {
  return x;
}

export function ImageSelector({
  name,
  itemPrefix,
  form,
  normalize = identity,
  multipleSelect = true,
}: IProps) {
  return (
    <ImageSelectDrawer
      multipleSelect={multipleSelect}
      onSelect={(images) => {
        let currValue = form.getFieldValue(name);

        if (multipleSelect) {
          currValue ??= [];
          currValue = currValue.concat(
            images.map((image) => {
              if (itemPrefix) {
                return { [itemPrefix]: normalize(image) };
              }
              return image;
            }),
          );
        } else {
          currValue = normalize(images[0]);

          if (itemPrefix) {
            currValue = { [itemPrefix]: currValue };
          }
        }

        form.setFieldValue(name, currValue);
      }}
    />
  );
}
