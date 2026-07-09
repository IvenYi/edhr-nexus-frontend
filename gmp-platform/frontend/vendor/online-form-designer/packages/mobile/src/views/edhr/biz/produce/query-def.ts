import type { ITab } from '@mobile/views/edhr/_utils_';

export const DefaultQueryTabs: ITab[] = [
  {
    id: 'task_all',
    name: '全部',
    icon: 'icon-platform:platform-quanbu',
    color: 'var(--ant-primary-color)',
    queryFields: {
      text_16332905013: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      text_43623170012: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_15121984711: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
    },
    type: 'builtin',
    count: 0,
  },
  {
    id: 'task_finished',
    name: '已完成',
    icon: 'icon-platform:platform-a-yidaoqi1',
    color: 'var(--ant-success-color)',
    queryFields: {
      text_15121984711: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
      text_43623170012: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_16332905013: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      enum_57284559018: {
        valueType: 'raw',
        rawValue: 'finished',
        field: 'f_status__jhwd',
        ope: ['eq'],
      },
    },
    type: 'builtin',
    count: 0,
  },
  {
    id: 'task_running',
    name: '进行中',
    icon: 'icon-platform:platform-weidaoqi',
    color: '#EFA332',
    queryFields: {
      text_15121984711: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
      text_43623170012: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_16332905013: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      enum_57284559018: {
        valueType: 'raw',
        rawValue: 'running',
        field: 'f_status__jhwd',
        ope: ['eq'],
      },
    },
    type: 'builtin',
    count: 0,
  },
  {
    id: 'task_waiting',
    name: '未开始',
    icon: 'icon-platform:platform-mission-center',
    color: 'var(--van-tab-text-color)',
    queryFields: {
      text_15121984711: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
      text_43623170012: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_16332905013: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      enum_57284559018: {
        valueType: 'raw',
        rawValue: 'waiting',
        field: 'f_status__jhwd',
        ope: ['eq'],
      },
    },
    type: 'builtin',
    count: 0,
  },
];
