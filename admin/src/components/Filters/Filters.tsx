import { Drawer, FloatButton, Space, Button, Input, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import type { TFilters } from './types';
import { useMemo, useState } from 'react';
import { DateRange } from '../DateRange';
import { UserSearchInput } from '../UserSearchInput';
import { LabelSearchInput } from '../LabelSearchInput';
import { taskTypeOptions } from '../TaskForm/constants';
import { SyncFiltersOnMount } from './SyncFilterOnMount';
import { ListenEnterPress } from './ListenEnterPress';

interface IProps<T> {
  values: T;
  onChange(key: keyof T, values: unknown): void;
  resetFilter(): void;
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
  resetFilter,
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

  const onFilterReset = () => {
    resetFilter();
    setTmpFilters({} as T);
    setShowDrawer(false);
  };

  const content = useMemo(() => {
    return config.map((filter, i) => {
      switch (filter.type) {
        case 'select': {
          return (
            <Space
              key={`${filter.type}${i}`}
              direction="vertical"
              style={{ width: '100%' }}
            >
              {filter.label}
              <Select
                disabled={filter.disabled}
                style={{ width: '100%' }}
                value={tmpFilters[filter.name]}
                options={filter.options}
                allowClear
                onChange={(v) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.name]: v,
                  });
                }}
              />
            </Space>
          );
        }

        case 'task-types-selector': {
          return (
            <Space
              key={`${filter.type}${i}`}
              direction="vertical"
              style={{ width: '100%' }}
            >
              {filter.label}
              <Select
                mode="multiple"
                disabled={filter.disabled}
                style={{ width: '100%' }}
                value={tmpFilters[filter.name]}
                options={taskTypeOptions}
                allowClear
                onChange={(v) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.name]: v,
                  });
                }}
              />
            </Space>
          );
        }

        case 'label-selector': {
          return (
            <Space
              key={`${filter.type}${i}`}
              direction="vertical"
              style={{ width: '100%' }}
            >
              {filter.label}
              <LabelSearchInput
                labelType={filter.labelType}
                disabled={filter.disabled}
                value={tmpFilters[filter.name]}
                onChange={(v) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.name]: v,
                  });
                }}
                maxCount={filter.maxCount}
              />
            </Space>
          );
        }

        case 'user-selector': {
          return (
            <Space
              key={`${filter.type}${i}`}
              direction="vertical"
              style={{ width: '100%' }}
            >
              {filter.label}
              <UserSearchInput
                disabled={filter.disabled}
                value={tmpFilters[filter.name]}
                onChange={(v) => {
                  setTmpFilters({
                    ...tmpFilters,
                    [filter.name]: v,
                  });
                }}
                maxCount={filter.maxCount}
              />
            </Space>
          );
        }

        case 'search-string': {
          return (
            <Space key={`${filter.type}${i}`} direction="vertical">
              {filter.label}
              <Input
                disabled={filter.disabled}
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
                disabled={filter.disabled}
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
                disabled={filter.disabled}
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
                disabled={filter.disabled}
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
        tooltip="Open filters"
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
        footer={
          <Space>
            <Button onClick={onApplyTmpFilters} type="primary">
              Submit
            </Button>
            <Button onClick={onDrawerClose}>Cancel</Button>
            <Button onClick={onFilterReset} type="dashed">
              Reset
            </Button>
          </Space>
        }
      >
        <ListenEnterPress callback={onApplyTmpFilters} />
        <SyncFiltersOnMount values={values} setTmpFilters={setTmpFilters} />
        <Space direction="vertical" size="large">
          {content}
        </Space>
      </Drawer>
    </>
  );
}
