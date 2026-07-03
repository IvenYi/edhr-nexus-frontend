import { getDateRanges } from '../../../utils/dateUtil';

const { DAY_NOW, WEEK_NOW, MONTH_NOW } = getDateRanges();

export const QUERY_DEFINITION_DATA = {
  userId_tab_order: [
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
      id: 'task_waiting',
      name: '未开始',
      icon: 'icon-park:file-tips',
      color: '#999999',
      query: {
        status_: 'waiting',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_unfinished',
      name: '进行中',
      icon: 'icon-park:file-date',
      color: '#1890FF',
      query: {
        status_: 'unfinished',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_finished',
      name: '已完成',
      icon: 'icon-park:file-success',
      color: 'var(--ant-success-color)',
      query: {
        status_: 'finished',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    // {
    //   id: 'task_day_now',
    //   name: '今日工单',
    //   icon: 'icon-park:notes',
    //   color: 'var(--ant-warning-color-hover)',
    //   query: {
    //     'create_time_.ge': DAY_NOW?.startDate,
    //     'create_time_.le': DAY_NOW?.endDate,
    //   },
    //   createType: 'BUILT_IN',
    //   checked: true,
    // },
    // {
    //   id: 'task_week_now',
    //   name: '本周工单',
    //   icon: 'icon-park:notes',
    //   color: 'var(--ant-warning-color-active)',
    //   query: {
    //     'create_time_.ge': WEEK_NOW?.startDate,
    //     'create_time_.le': WEEK_NOW?.endDate,
    //   },
    //   createType: 'BUILT_IN',
    //   checked: true,
    // },
    // {
    //   id: 'task_month_now',
    //   name: '本月工单',
    //   icon: 'icon-park:notes',
    //   color: 'var(--ant-info-color-deprecated-border)',
    //   query: {
    //     'create_time_.ge': MONTH_NOW?.startDate,
    //     'create_time_.le': MONTH_NOW?.endDate,
    //   },
    //   createType: 'BUILT_IN',
    //   checked: true,
    // },
  ],
  userId_tab_task: [
    // {
    //   id: 'task_all',
    //   name: '全部',
    //   icon: 'icon-park:notes',
    //   color: 'var(--ant-primary-color)',
    //   query: {},
    //   createType: 'BUILT_IN',
    //   checked: true,
    // },
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
      id: 'task_waiting',
      name: '未开始',
      icon: 'icon-park:file-tips',
      color: '#1890FF',
      query: {
        f_status__jhwd: 'waiting',
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_running',
      name: '进行中',
      icon: 'icon-park:file-date',
      color: 'var(--ant-info-color)',
      query: {
        f_status__jhwd: 'running',
      },
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
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_day_now',
      name: '今日批次',
      icon: 'icon-park:notes',
      color: 'var(--ant-warning-color-hover)',
      query: {
        'f_create_time__jhwd.ge': DAY_NOW?.startDate,
        'f_create_time__jhwd.le': DAY_NOW?.endDate,
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_week_now',
      name: '本周批次',
      icon: 'icon-park:notes',
      color: 'var(--ant-warning-color-active)',
      query: {
        'f_create_time__jhwd.ge': WEEK_NOW?.startDate,
        'f_create_time__jhwd.le': WEEK_NOW?.endDate,
      },
      createType: 'BUILT_IN',
      checked: true,
    },
    {
      id: 'task_month_now',
      name: '本月批次',
      icon: 'icon-park:notes',
      color: 'var(--ant-info-color-deprecated-border)',
      query: {
        'f_create_time__jhwd.ge': MONTH_NOW?.startDate,
        'f_create_time__jhwd.le': MONTH_NOW?.endDate,
      },
      createType: 'BUILT_IN',
      checked: true,
    },
  ],
};
