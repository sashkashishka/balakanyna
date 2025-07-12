import { useStore } from '@nanostores/react';
import { useMemo, useState } from 'react';
import { Select, type SelectProps, Spin } from 'antd';

import { debounce } from '@/utils/debounce';
import { getSearchParam } from '@/utils/network';
import { makeTmpValueStore } from './store';
import type { IUser } from 'shared/types/user';

const DEBOUNCE_DELAY = 200;

// TODO: think how to refactor it to keep everything in stores
async function fetchUsers(search: string) {
  const resp = await fetch(
    `/api/admin/user/search${getSearchParam('search', search)}`,
    {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    },
  );

  if (resp.ok) {
    return resp.json();
  }

  return [];
}

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
  const { $tmpValue, setTmpValue } = useMemo(
    () =>
      makeTmpValueStore(Array.isArray(value!) ? value! : [value!], onChange!),
    [],
  );

  const tmpValue = useStore($tmpValue);

  const [users, setUsers] = useState<IUser[]>([]);
  const [fetching, setFetching] = useState(false);

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string) => {
      console.log(value);
      setFetching(true);
      const data = await fetchUsers(value);
      setUsers(data);
      setFetching(false);
    };

    return debounce(loadOptions, DEBOUNCE_DELAY);
  }, []);

  const options = useMemo<SelectProps['options']>(() => {
    if (!users) return [];

    return users.map(({ id, name, surname }) => ({
      label: `${name} ${surname}`,
      value: id,
    }));
  }, [users]);

  return (
    <Select
      style={{ width: '100%' }}
      disabled={disabled}
      mode="multiple"
      maxCount={maxCount}
      allowClear
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      value={tmpValue}
      placeholder="Alice"
      onChange={(values) => {
        setTmpValue(values);
      }}
      options={options}
    />
  );
}
