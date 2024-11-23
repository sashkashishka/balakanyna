import type { SelectProps } from 'antd';
import { atom, onSet } from 'nanostores';

import { safeSS } from '@/utils/storage';
import { LRUCache } from '@/utils/cache';

const SS_KEY = 'user-search-input';

const cache = LRUCache.restore(safeSS.getItem(SS_KEY));

export function makeTmpValueStore(
  initialValue: number[],
  onChange: (v: number[]) => void,
) {
  const initTmpValue = Array.isArray(initialValue)
    ? initialValue.map((v) => ({
        label: cache.get(String(v)) as string,
        value: v,
      }))
    : [];

  const $tmpValue = atom<SelectProps['options']>(initTmpValue);

  onSet($tmpValue, ({ newValue }) => {
    const values = newValue?.map(({ value }) => Number(value)!) || [];
    onChange(values);
  });

  onSet($tmpValue, ({ newValue }) => {
    newValue?.forEach((item) => cache.put(String(item.value), item.label));
    safeSS.setItem(SS_KEY, cache.serialize());
  });

  function setTmpValue(v: SelectProps['options']) {
    $tmpValue.set(v);
  }

  return { $tmpValue, setTmpValue };
}
