import { useStore } from '@nanostores/react';
import { useCallback, useMemo, useState } from 'react';
import { Select, type SelectProps, Spin, Tag } from 'antd';

import { debounce } from '@/utils/debounce';
import { defaultLabelListFilters, makeLabelsStore } from '@/stores/label';
import { createListFilters } from '@/stores/_list-filter';
import type { ILabel } from 'shared/types/label';

const DEBOUNCE_DELAY = 200;

interface IProps {
  labelType: ILabel['type'];
  maxCount?: number;
  value?: number[];
  onChange?(ids: number[]): void;
  disabled?: boolean;
}

export function LabelSearchInput({
  maxCount = 1,
  disabled,
  value,
  labelType,
  onChange,
}: IProps) {
  const [{ $filtersSearchParams, setListFilter }] = useState(() =>
    createListFilters({ ...defaultLabelListFilters, type: labelType }),
  );
  const [$labels] = useState(() => makeLabelsStore($filtersSearchParams));

  const { data, loading } = useStore($labels);

  const options = useMemo<SelectProps['options']>(() => {
    if (!data) return [];

    return data?.items?.map(({ id, name, config }) => ({
      label: (
        <Tag color={config?.color} bordered={config?.bordered}>
          {name}
        </Tag>
      ),
      value: id,
    }));
  }, [data]);

  const handleSearch = useCallback(
    debounce((search) => setListFilter('name', search), DEBOUNCE_DELAY),
    [setListFilter],
  );

  return (
    <Select
      style={{ width: '100%' }}
      disabled={disabled}
      mode="multiple"
      maxCount={maxCount}
      allowClear
      labelInValue
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={loading ? <Spin size="small" /> : null}
      value={value}
      placeholder="Games"
      onChange={(values) => {
        onChange?.(
          (values as unknown as { value: number }[])?.map(
            ({ value }) => Number(value)!,
          ) || [],
        );
      }}
      options={options}
    />
  );
}
