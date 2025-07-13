import { useState } from 'react';
import { Button, Drawer } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { FetcherStore } from '@nanostores/query';
import type { IProgramFull } from 'shared/types/program';

import { CopyProgramForm } from '../CopyProgramForm';
import { useStore } from '@nanostores/react';

interface IProps {
  $program: FetcherStore<IProgramFull>;
}

export function CopyProgramDrawer({ $program }: IProps) {
  const [open, setOpen] = useState(false);
  const { data, loading, error } = useStore($program);

  if (loading || error || !data) {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        icon={<CopyOutlined />}
      >
        Duplicate
      </Button>

      <Drawer
        size="large"
        title="Copy program"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <CopyProgramForm
          name="copy-program"
          program={data}
          initialValues={{
            id: data.id,
            startDatetime: new Date().toISOString(),
            expirationDatetime: new Date(Date.now() + 10000).toISOString(),
          }}
        />
      </Drawer>
    </>
  );
}
