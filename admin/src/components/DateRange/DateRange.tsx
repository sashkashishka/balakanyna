import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface IProps {
  disabled?: boolean;
  onChange(mindate?: string, maxdate?: string): void;
  mindate?: string;
  maxdate?: string;
}

export function DateRange({ disabled, onChange, mindate, maxdate }: IProps) {
  const min = mindate ? dayjs(mindate) : undefined;
  const max = maxdate ? dayjs(maxdate) : undefined;

  return (
    <RangePicker
      disabled={disabled}
      allowEmpty={[true, true]}
      value={[min, max]}
      onChange={(range) => {
        const [min, max] = range || [];
        onChange(min?.toISOString(), max?.toISOString());
      }}
    />
  );
}
