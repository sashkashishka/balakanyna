import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Spin } from 'antd';

import type { IImage } from '@/types/image';

import { ImageForm } from '../ImageForm';

interface IProps {
  $image: FetcherStore<IImage>;
}

export function UpdateImageDrawerContent({ $image }: IProps) {
  const { data, loading, error } = useStore($image);

  if (loading || error || !data) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <ImageForm
      name={`image-update-${data.id}`}
      action="update"
      initialValues={data}
    />
  );
}
