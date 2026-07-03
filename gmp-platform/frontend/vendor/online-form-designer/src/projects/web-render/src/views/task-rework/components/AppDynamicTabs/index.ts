import AppDynamicTabs from './index.vue';
import { useAppDynamicTabs } from './useAppDynamicTabs';

export const QUERY_DEFINITION_DATA = {
  userId_task_rework: [
    {
      id: 'task_all',
      name: '全部',
      icon: 'icon-park:notes',
      color: 'var(--ant-primary-color)',
      query: {},
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_finished',
      name: '已完成',
      icon: 'icon-park:file-success',
      color: 'var(--ant-success-color)',
      query: {
        f_status__jhwd: 'finished',
      },
      queryOperators: {
        f_status__jhwd: 'eq',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_running',
      name: '进行中',
      icon: 'icon-park:file-tips',
      color: 'var(--van-tab-text-color)',
      query: {
        f_status__jhwd: 'running',
      },
      queryOperators: {
        f_status__jhwd: 'eq',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_waiting',
      name: '未开始',
      icon: 'icon-park:file-tips',
      color: 'var(--van-tab-text-color)',
      query: {
        f_status__jhwd: 'waiting',
      },
      queryOperators: {
        f_status__jhwd: 'eq',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
  ],
};

export { AppDynamicTabs, useAppDynamicTabs };
