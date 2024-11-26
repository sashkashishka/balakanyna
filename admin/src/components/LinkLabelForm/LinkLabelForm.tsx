import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { notification, Select, Spin, Tag } from 'antd';

import type { ILabel } from '@/types/label';
import {
  $linkImageLabel,
  $linkTaskLabel,
  $unlinkImageLabel,
  $unlinkTaskLabel,
} from '@/stores/link';
import { defaultLabelListFilters, makeLabelsStore } from '@/stores/label';
import { createListFilters } from '@/stores/_list-filter';
import { debounce } from '@/utils/debounce';

interface IProps {
  type: ILabel['type'];
  entityId: number;
  initialLabels: ILabel[];
}

const mutators = {
  task: [$linkTaskLabel, $unlinkTaskLabel, 'taskId'],
  image: [$linkImageLabel, $unlinkImageLabel, 'imageId'],
} as const;

const DEBOUNCE_DELAY = 200;

interface IOption {
  label: ReactNode;
  value: number;
}

export function LinkLabelForm({ type, entityId, initialLabels }: IProps) {
  const [$link, $unlink, entityName] = mutators[type];
  const { mutate: link, loading: linkLoading } = useStore($link!);
  const { mutate: unlink, loading: unlinkLoading } = useStore($unlink!);

  const defaultFilters = useMemo(() => {
    return {
      ...defaultLabelListFilters,
      type,
    };
  }, []);

  const [{ $filtersSearchParams, setListFilter }] = useState(() =>
    createListFilters(defaultFilters),
  );
  const [$labels] = useState(() => makeLabelsStore($filtersSearchParams));

  const { data: labels } = useStore($labels);

  const [values, setValues] = useState<IOption[]>(() => {
    return initialLabels.map((item) => ({
      label: (
        <Tag color={item.config.color} bordered={item.config.bordered}>
          {item.name}
        </Tag>
      ),
      value: item.id,
    }));
  });

  const options = useMemo(() => {
    if (!labels) return [];

    return labels.items?.map((item) => ({
      label: (
        <Tag color={item.config.color} bordered={item.config.bordered}>
          {item.name}
        </Tag>
      ),
      value: item.id,
    }));
  }, [labels]);

  async function onLink(item: IOption) {
    try {
      const body = { [entityName]: entityId, labelId: item.value };

      const resp = (await link(
        // @ts-expect-error here right argument is passed
        body,
      )) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = `Linked label with ${type}!`;
        notification.success({ message });

        setValues([...values, item]);

        return;
      }

      if ('error' in respData && typeof respData.message === 'string') {
        return notification.error({ message: respData.message });
      }

      throw respData;
    } catch (e) {
      console.error(e);
      notification.error({ message: 'Unexpected error' });
    }
  }

  async function onUnlink(item: IOption) {
    try {
      const body = { [entityName]: entityId, labelId: item.value };

      const resp = (await unlink(
        // @ts-expect-error here right argument is passed
        body,
      )) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = `Unlinked label with ${type}!`;
        notification.success({ message });

        setValues(values.filter((v) => v.value !== item.value));

        return;
      }

      if ('error' in respData && typeof respData.message === 'string') {
        return notification.error({ message: respData.message });
      }

      throw respData;
    } catch (e) {
      console.error(e);
      notification.error({ message: 'Unexpected error' });
    }
  }

  const handleSearch = useCallback(
    debounce((search) => setListFilter('name', search), DEBOUNCE_DELAY),
    [setListFilter],
  );

  return (
    <Select
      style={{ width: '100%' }}
      mode="multiple"
      disabled={linkLoading || unlinkLoading}
      loading={linkLoading || unlinkLoading}
      labelInValue
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={
        linkLoading || unlinkLoading ? <Spin size="small" /> : null
      }
      value={values}
      placeholder="Alice"
      onSelect={(item) => {
        onLink(item);
      }}
      onDeselect={(item) => {
        onUnlink(item);
      }}
      options={options}
    />
  );
}
