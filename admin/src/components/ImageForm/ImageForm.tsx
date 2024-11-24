import { useStore } from '@nanostores/react';
import { Button, Col, Form, Input, notification, Row, Image, Upload } from 'antd';

import type { IImage } from '@/types/image';
import { $uploadImage } from '@/stores/image';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IImageFormInitialValues extends IImage {}

interface IProps {
  name: string;
  action: 'update' | 'create';
  initialValues?: Partial<IImageFormInitialValues>;
  onSuccess?(p: IImage): void;
}

export function ImageForm({ name, action, initialValues, onSuccess }: IProps) {
  const [form] = Form.useForm<IImage>();
  const tag = Form.useWatch((v) => v, form);

  const { mutate: uploadImage } = useStore($uploadImage);

  const isCreate = action === 'create';

  // async function onFinish(data: IImage) {
  //   try {
  //     const mutate = isCreate ? createImage : updateImage;

  //     const body = {
  //       ...data,
  //       config: { ...data.config, bordered: Boolean(data.config.bordered) },
  //     };

  //     const resp = (await mutate(body)) as Response;
  //     const respData = await resp.json();

  //     if (resp.ok) {
  //       const message = 'id' in respData ? 'Image updated' : 'Image created';
  //       notification.success({ message });

  //       if (isCreate) {
  //         return onSuccess?.(respData);
  //       }

  //       return;
  //     }

  //     if ('error' in respData && typeof respData.message === 'string') {
  //       return notification.error({ message: respData.message });
  //     }

  //     throw respData;
  //   } catch (e) {
  //     console.error(e);
  //     notification.error({ message: 'Unexpected error' });
  //   }
  // }
  return (
    <Upload
      action="/api/admin/image/upload"
      method="post"
      name="image"
      multiple={false}
      maxCount={1}
      listType="picture-card"
      // fileList={fileList}
      // onPreview={handlePreview}
      // onChange={handleChange}
    >
      upload
      {/* {fileList.length >= 8 ? null : uploadButton} */}
    </Upload>
  );

  // return (
  //   <Form
  //     form={form}
  //     name={name}
  //     style={{ maxWidth: '650px' }}
  //     initialValues={initialValues}
  //     onFinish={onFinish}
  //     autoComplete="off"
  //     layout="vertical"
  //   >
  //     {/* <Image */}
  //     {/*   src={} */}
  //     {/* /> */}

  //     <Row gutter={24}>
  //       <Form.Item<IImage> name="id" hidden>
  //         <Input type="hidden" />
  //       </Form.Item>

  //       <Col span={24} sm={12}>
  //         <Form.Item<IImage>
  //           label="Name"
  //           name="name"
  //           rules={[{ required: true, message: 'Please input label name!' }]}
  //         >
  //           <Input type="text" placeholder="e.g. Games" />
  //         </Form.Item>
  //       </Col>

  //       <Col span={24}>
  //         <Form.Item style={{ marginBottom: 0 }}>
  //           <Button type="primary" htmlType="submit" size="large">
  //             {isCreate ? 'Create' : 'Update'}
  //           </Button>
  //         </Form.Item>
  //       </Col>
  //     </Row>
  //   </Form>
  // );
}
