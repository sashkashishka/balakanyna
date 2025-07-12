import { useKeyDown } from '@/hooks/useKeyDown';

interface IProps {
  callback(): void;
}

export function ListenEnterPress({ callback }: IProps) {
  useKeyDown('Enter', callback);

  return null;
}
