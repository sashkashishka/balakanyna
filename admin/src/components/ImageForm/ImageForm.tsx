import { theme, notification, Image, Upload, Flex, Space } from 'antd';

import type { IImage } from 'shared/types/image';
import { invalidateKeys } from '@/stores/_query';
import { IMAGE_KEYS } from '@/stores/image';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
  initialValues?: Partial<IImage>;
  onSuccess?(p: IImage[]): void;
}

export function ImageForm({ initialValues, onSuccess }: IProps) {
  const {
    token: { colorBgLayout, borderRadiusLG, paddingSM },
  } = theme.useToken();

  if (initialValues) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          width: '320px',
          height: '320px',
          padding: paddingSM,
          borderRadius: borderRadiusLG,
          background: colorBgLayout,
        }}
      >
        <Image
          src={initialValues.path}
          width="300px"
          height="300px"
          style={{ objectFit: 'contain' }}
        />
      </Flex>
    );
  }

  return (
    <Upload.Dragger
      action="/api/admin/image/upload"
      method="post"
      name="image"
      multiple={true}
      maxCount={10}
      listType="picture-card"
      onRemove={() => {
        notification.error({
          message: "This won't remove image from the database",
        });
      }}
      onChange={({ fileList }) => {
        if (fileList?.length > 0 && fileList.every((f) => f.status === 'done')) {
          invalidateKeys((key) => key.startsWith(IMAGE_KEYS.list));
          onSuccess?.(fileList.map((f) => f.response[0]));
        }

        if (fileList.some((f) => f.status === 'error')) {
          const file = fileList.find((f) => f.status === 'error');
          const { response } = file!;

          if ('error' in response && typeof response.message === 'string') {
            notification.error({ message: response.message });
          }
        }
      }}
    >
      <Space direction="vertical" size="small">
        <PlusOutlined />
        Click or drag image to this area to upload
      </Space>
    </Upload.Dragger>
  );
}
