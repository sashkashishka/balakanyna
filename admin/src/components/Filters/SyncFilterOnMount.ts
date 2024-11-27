import { useEffect } from 'react';

interface IProps {
  values: unknown;
  setTmpFilters(v: unknown): void;
}

export function SyncFiltersOnMount({ values, setTmpFilters }: IProps) {
  useEffect(() => {
    setTmpFilters(values);
  }, [values]);

  return null;
}
