import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Space, Spin } from 'antd';

import type { IImage } from 'shared/types/image';

import { ImageForm } from '../ImageForm';
import { LinkLabelForm } from '../LinkLabelForm';

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
    <Space direction="vertical" size="large">
      <ImageForm initialValues={data} />

      <LinkLabelForm
        type="image"
        entityId={data.id}
        initialLabels={data.labels}
      />
    </Space>
  );
}
