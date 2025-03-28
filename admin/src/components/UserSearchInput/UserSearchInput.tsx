import { atom, computed } from 'nanostores';
import { useStore } from '@nanostores/react';
import { useCallback, useMemo, useState } from 'react';
import { Select, type SelectProps, Spin } from 'antd';

import { makeUserSearchStore } from '@/stores/user';
import { debounce } from '@/utils/debounce';
import { getSearchParam } from '@/utils/network';
import { makeTmpValueStore } from './store';

const DEBOUNCE_DELAY = 200;

interface IProps {
  maxCount?: number;
  value?: number[] | number;
  onChange?(ids: number[]): void;
  disabled?: boolean;
}

export function UserSearchInput({
  maxCount = 1,
  disabled,
  value,
  onChange,
}: IProps) {
  const [{ $tmpValue, setTmpValue }] = useState(
    makeTmpValueStore(Array.isArray(value!) ? value! : [value!], onChange!),
  );

  const tmpValue = useStore($tmpValue);

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
      style={{ width: '100%' }}
      disabled={disabled}
      mode="multiple"
      maxCount={maxCount}
      allowClear
      labelInValue
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={loading ? <Spin size="small" /> : null}
      value={tmpValue}
      placeholder="Alice"
      onChange={(values) => {
        setTmpValue(values);
      }}
      options={options}
    />
  );
}
