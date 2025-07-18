import { useState } from 'react';
import { Button, Drawer, Space } from 'antd';

import type { IImageListFilters } from '@/stores/image';
import type { IImage } from 'shared/types/image';
import { ImageSelectDrawerContent } from './ImageSelectDrawerContent';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
  multipleSelect?: boolean;
  filters?: Partial<IImageListFilters>;
  onSelect?(p: IImage[]): void;
}

export function ImageSelectDrawer({
  onSelect,
  filters,
  multipleSelect,
}: IProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IImage[]>();

  const onDrawerClose = () => {
    setSelected(undefined);
    setOpen(false);
  };

  const onDrawerSelect = () => {
    onSelect?.(selected!);
    setSelected(undefined);
    setOpen(false);
  };

  return (
    <>
      <Button
        icon={<PlusOutlined />}
        type="dashed"
        onClick={() => setOpen(true)}
        style={{
          height: '60px',
          width: '60px',
        }}
      />

      <Drawer
        size="large"
        title="Pick images"
        open={open}
        onClose={onDrawerClose}
        footer={
          <Space>
            <Button
              onClick={onDrawerSelect}
              type="primary"
              disabled={!selected}
            >
              Select
            </Button>
            <Button onClick={onDrawerClose}>Cancel</Button>
          </Space>
        }
        destroyOnClose
      >
        <ImageSelectDrawerContent
          filters={filters}
          setSelected={setSelected}
          multipleSelect={multipleSelect}
        />
      </Drawer>
    </>
  );
}
