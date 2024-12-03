import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Spin } from 'antd';

import type { IProgramFull } from 'shared/types/program';

import { ProgramForm } from '../ProgramForm';

interface IProps {
  $program: FetcherStore<IProgramFull>;
}

export function UpdateProgramDrawerContent({ $program }: IProps) {
  const { data, loading, error } = useStore($program);

  if (loading || error || !data) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <ProgramForm
      name={`program-update-${data.id}`}
      action="update"
      initialValues={data}
    />
  );
}
