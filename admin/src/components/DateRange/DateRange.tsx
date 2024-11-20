import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface IProps {
  onChange(mindate?: string, maxdate?: string): void;
  mindate?: string;
  maxdate?: string;
}

export function DateRange({ onChange, mindate, maxdate }: IProps) {
  const min = mindate ? dayjs(mindate) : undefined;
  const max = maxdate ? dayjs(maxdate) : undefined;

  return (
    <RangePicker
      allowEmpty={[true, true]}
      value={[min, max]}
      onChange={(range) => {
        const [min, max] = range || [];
        onChange(min?.toISOString(), max?.toISOString());
      }}
    />
  );
}
