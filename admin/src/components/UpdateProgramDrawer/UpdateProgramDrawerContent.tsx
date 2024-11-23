import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Spin } from 'antd';
import dayjs from 'dayjs';

import type { IProgramFull } from '@/types/program';

import { ProgramForm } from '../ProgramForm';

interface IProps {
  $program: FetcherStore<IProgramFull>;
}

export function UpdateProgramDrawerContent({ $program }: IProps) {
  const { data, loading, error } = useStore($program);

  const programFormValues = useMemo(() => {
    if (!data) return undefined;

    return {
      ...data,
      userId: [data.userId],
      startDatetime: dayjs(data.startDatetime),
      expirationDatetime: dayjs(data.expirationDatetime),
    };
  }, [data]);

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
      initialValues={programFormValues}
    />
  );
}
