import type { SelectProps } from 'antd';
import { atom, onSet } from 'nanostores';

import { safeLS } from '@/utils/storage';
import { LRUCache } from '@/utils/cache';

const LS_KEY = 'user-search-input';

const cache = LRUCache.restore(safeLS.getItem(LS_KEY));

export function makeTmpValueStore(
  initialValue: number[],
  onChange: (v: number[]) => void,
) {
  const initTmpValue = Array.isArray(initialValue)
    ? initialValue.filter(Boolean).map((v) => ({
        label:
          cache.get(String(v)) === -1 ? v : (cache.get(String(v)) as string),
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
    safeLS.setItem(LS_KEY, cache.serialize());
  });

  function setTmpValue(v: SelectProps['options']) {
    $tmpValue.set(v);
  }

  return { $tmpValue, setTmpValue };
}
