import { useState } from 'react';
import { Button, Drawer, Space, Image } from 'antd';

import type { IImageListFilters } from '@/stores/image';
import type { IImage } from 'shared/types/image';
import { ImageSelectDrawerContent } from './ImageSelectDrawerContent';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
  filters?: Partial<IImageListFilters>;
  onSelect?(p: IImage): void;
}

export function ImageSelectDrawer({ onSelect, filters }: IProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IImage>();

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
        title="Pick an image"
        open={open}
        onClose={onDrawerClose}
        footer={
          <Space>
            <Image width="60px" height="60px" src={selected?.path} />

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
        <ImageSelectDrawerContent filters={filters} setSelected={setSelected} />
      </Drawer>
    </>
  );
}
