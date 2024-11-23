import { atom, computed } from 'nanostores';
import { useStore } from '@nanostores/react';
import { useCallback, useMemo, useState } from 'react';
import { Select, type SelectProps, Spin } from 'antd';

import { makeUserSearchStore } from '@/stores/user';
import { debounce } from '@/utils/debounce';
import { getSearchParam } from '@/utils/network';

const DEBOUNCE_DELAY = 200;

interface IProps {
  value?: number;
  onChange?(id: number): void;
  disabled?: boolean;
}

export function UserSearchInput({ disabled, value, onChange }: IProps) {
  const [$search] = useState(() => atom(''));
  const [$searchParams] = useState(() =>
    computed([$search], (search) => getSearchParam('search', search)),
  );
  const [$userSearch] = useState(() => makeUserSearchStore($searchParams));

  const { data, loading } = useStore($userSearch);

  const options = useMemo<SelectProps['options']>(() => {
    if (!data) return [];

    return data.map(({ id, name, surname }) => ({
      label: `${name} ${surname}`,
      value: id,
    }));
  }, [data]);

  const handleSearch = useCallback(
    debounce($search.set.bind($search), DEBOUNCE_DELAY),
    [$search],
  );

  return (
    <Select
      disabled={disabled}
      mode="multiple"
      maxCount={1}
      allowClear
      labelInValue
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={loading ? <Spin size="small" /> : null}
      value={value}
      placeholder="Alice"
      onChange={onChange}
      options={options}
    />
  );
}
