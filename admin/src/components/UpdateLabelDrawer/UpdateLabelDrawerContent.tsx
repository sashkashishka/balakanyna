import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Spin } from 'antd';

import type { ILabel } from '@/types/label';

import { LabelForm } from '../LabelForm';

interface IProps {
  $label: FetcherStore<ILabel>;
}

export function UpdateLabelDrawerContent({ $label }: IProps) {
  const { data, loading, error } = useStore($label);

  if (loading || error || !data) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <LabelForm
      name={`label-update-${data.id}`}
      action="update"
      initialValues={data}
    />
  );
}
