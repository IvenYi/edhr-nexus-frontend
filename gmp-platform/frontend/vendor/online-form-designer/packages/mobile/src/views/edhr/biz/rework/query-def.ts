import type { ITab } from '@mobile/views/edhr/_utils_';

export const DefaultQueryTabs: ITab[] = [
  {
    id: 'task_all',
    name: '全部',
    icon: 'icon-platform:platform-quanbu',
    color: 'var(--ant-primary-color)',
    queryFields: {
      text_33031156215: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_65670701716: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      text_25452699414: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
    },
    type: 'builtin',
    count: 136,
  },
  {
    id: 'task_finished',
    name: '已完成',
    icon: 'icon-platform:platform-a-yidaoqi1',
    color: 'var(--ant-success-color)',
    queryFields: {
      text_25452699414: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
      text_33031156215: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_65670701716: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      enum_9555041224: {
        valueType: 'raw',
        rawValue: 'finished',
        field: 'f_status__jhwd',
        ope: ['eq'],
      },
      integer_13915909813: {
        valueType: 'raw',
        rawValue: [1, null],
      },
    },
    type: 'builtin',
    count: 31,
  },
  {
    id: 'task_running',
    name: '进行中',
    icon: 'icon-platform:platform-weidaoqi',
    color: '#EFA332',
    queryFields: {
      text_25452699414: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
      text_33031156215: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_65670701716: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      enum_9555041224: {
        valueType: 'raw',
        rawValue: 'running',
        field: 'f_status__jhwd',
        ope: ['eq'],
      },
      integer_13915909813: {
        valueType: 'raw',
        rawValue: [1, null],
      },
    },
    type: 'builtin',
    count: 72,
  },
  {
    id: 'task_waiting',
    name: '未开始',
    icon: 'icon-platform:platform-mission-center',
    color: 'var(--van-tab-text-color)',
    queryFields: {
      text_25452699414: {
        valueType: 'raw',
        field: 'f_name__jhwd',
        ope: ['like'],
      },
      text_33031156215: {
        valueType: 'raw',
        field: 'f_code__jhwd',
        ope: ['like'],
      },
      text_65670701716: {
        valueType: 'raw',
        field: 'f_order_code__jhwd',
        ope: ['like'],
      },
      enum_9555041224: {
        valueType: 'raw',
        rawValue: 'waiting',
        field: 'f_status__jhwd',
        ope: ['eq'],
      },
      integer_13915909813: {
        valueType: 'raw',
        rawValue: [1, null],
      },
    },
    type: 'builtin',
    count: 33,
  },
];
