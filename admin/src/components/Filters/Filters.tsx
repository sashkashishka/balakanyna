import { Drawer, FloatButton, Space, Button, Input } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import type { TFilters } from './types';
import { useMemo, useState } from 'react';
import { DateRange } from '../DateRange';

interface IProps<T> {
  values: T;
  onChange(key: keyof T, values: unknown): void;
  config: Array<TFilters>;
  activeCount: number;
  pagination: {
    name: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Filters<T extends Record<string, any>>({
  values,
  onChange,
  config,
  activeCount,
  pagination,
}: IProps<T>) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [tmpFilters, setTmpFilters] = useState(values);

  const onDrawerClose = () => {
    setShowDrawer(false);
    setTmpFilters(values);
  };

  const onApplyTmpFilters = () => {
    Object.keys(tmpFilters).forEach((key) => {
      onChange(key, tmpFilters[key]);
    });
    onChange(pagination.name, 1);
    setShowDrawer(false);
  };

  const content = useMemo(() => {
    return config.map((filter, i) => {
      switch (filter.type) {
        case 'search-string': {
          return (
            <Space key={`${filter.type}${i}`} direction="vertical">
              {filter.label}
              <Input
                placeholder={filter.placeholder}
                value={tmpFilters[filter.name]}
                type="text"
                onChange={(e) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.name]: e.target.value || undefined,
                  });
                }}
                allowClear
              />
            </Space>
          );
        }

        case 'number-range': {
          return (
            <Space key={`${filter.type}${i}`} direction="vertical">
              {filter.label}
              <Input
                value={tmpFilters[filter.minName]}
                placeholder="Min"
                type="number"
                onChange={(e) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.minName]: e.target.value || undefined,
                  });
                }}
                allowClear
              />
              <Input
                value={tmpFilters[filter.maxName]}
                placeholder="Max"
                type="number"
                onChange={(e) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.maxName]: e.target.value || undefined,
                  });
                }}
                allowClear
              />
            </Space>
          );
        }

        case 'date-range': {
          return (
            <Space key={`${filter.type}${i}`} direction="vertical">
              {filter.label}
              <DateRange
                mindate={tmpFilters[filter.minName]}
                maxdate={tmpFilters[filter.maxName]}
                onChange={(min, max) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.minName]: min,
                    [filter.maxName]: max,
                  });
                }}
              />
            </Space>
          );
        }

        default:
          return null;
      }
    });
  }, [config, tmpFilters]);

  return (
    <>
      <FloatButton
        shape="square"
        type="primary"
        icon={<FilterOutlined />}
        badge={{
          count: activeCount,
        }}
        onClick={() => setShowDrawer(true)}
      />

      <Drawer
        title="Filters"
        open={showDrawer}
        onClose={onDrawerClose}
        extra={
          <Space>
            <Button onClick={onDrawerClose}>Cancel</Button>
            <Button onClick={onApplyTmpFilters} type="primary">
              Submit
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="large">
          {content}
        </Space>
      </Drawer>
    </>
  );
}