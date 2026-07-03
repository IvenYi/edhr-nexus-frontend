import dayjs from 'dayjs';
import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';

// 设计类型，用于 dnd 的类型显示
export const DESIGN_TYPE = 'view-design';

// 默认的设计数据主键标识
export const DESIGN_DATA_KEY_TAG = 'id';

/**
 * 设计项标识标签属性
 */
export enum DesignItemAttribute {
  /**
   * 可以激活项的标识
   */
  ACTIVE_TAG = 'design-active-item',
  /**
   * 拖拽项标识属性
   */
  DRAG_TAG = 'design-drop-item',
  /**
   * 项排序值标识
   */
  INDEX_TAG = 'design-item-index',
  /**
   * 设计项标识属性
   */
  NODE_ID_TAG = 'design-item-id',
  /**
   * 项文本名称
   */
  DESIGN_NAME = 'design-item-name',
  /**
   * 分组标识
   */
  GROUP_TAG = 'design-group-tag',
  /**
   * 拖拽组类型
   */
  DRAG_GROUP_TYPE = 'drag-group-type',
  /**
   * 是否为行内元素
   */
  IS_INLINE_BLOCK = 'is-inline-block',
  /**
   * 特殊情况下，例如表格将表格元素自己复制了好几份，需要指定实际呈现元素在 querySelectorAll 中的位置。便于悬浮或者选中时位置的计算
   */
  SELECTOR_INDEX = 'selector-index',
}

/** 日期时间可选范围 */
const DateRangeMap = {
  // 本周
  WEEK_NOW: (current: number) => {
    const startDate = dayjs().startOf('week').add(1, 'day');
    const endDate = dayjs().endOf('week').add(1, 'day');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();

    return {
      // 设置区间之外的日期不可选
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 本月
  MONTH_NOW: (current: number) => {
    const startDate = dayjs().startOf('month');
    const endDate = dayjs().endOf('month');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();
    // 设置区间之外的日期不可选
    return {
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 本季度
  QUARTER_NOW: (current: number) => {
    const startDate = dayjs().startOf('quarter');
    const endDate = dayjs().endOf('quarter');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();
    return {
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 本年
  YEAR_NOW: (current: number) => {
    const startDate = dayjs().startOf('year');
    const endDate = dayjs().endOf('year');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();
    return {
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 上周
  WEEk_BEFORE: (current: number) => {
    dayjs.locale('zh-cn');

    const today = dayjs();
    const lastWeekStart = today.startOf('week').subtract(1, 'week');
    const lastWeekEnd = lastWeekStart.clone().endOf('week');
    // const startDate = dayjs().add(-1, 'week').startOf('week').add(1, 'day');
    // const endDate = dayjs().add(-1, 'week').endOf('week').add(1, 'day');

    // 获取时间戳
    // const startTDS = startDate.valueOf();
    const startTDS = lastWeekStart.valueOf();
    // const endTDS = endDate.valueOf();
    const endTDS = lastWeekEnd.valueOf();

    return {
      disabled: current < startTDS || current > endTDS,
      minDate: lastWeekStart,
      maxDate: lastWeekEnd,
    };
  },
  // 上月
  MONTH_BEFORE: (current: number) => {
    const startDate = dayjs().add(-1, 'month').startOf('month');
    const endDate = dayjs().add(-1, 'month').endOf('month');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();

    return {
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 上季度
  QUARTER_BEFORE: (current: number) => {
    const startDate = dayjs().add(-1, 'quarter').startOf('quarter');
    const endDate = dayjs().add(-1, 'quarter').endOf('quarter');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();
    return {
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 上年
  YEAR_BEFORE: (current: number) => {
    const startDate = dayjs().add(-1, 'year').startOf('year');
    const endDate = dayjs().add(-1, 'year').endOf('year');

    // 获取时间戳
    const startTDS = startDate.valueOf();
    const endTDS = endDate.valueOf();
    return {
      disabled: current < startTDS || current > endTDS,
      minDate: startDate,
      maxDate: endDate,
    };
  },
  // 当日及以前
  DATE_BEFORE: (current: number) => {
    const endDate = dayjs().add(-1, 'day');

    const nowTDS = endDate.valueOf();
    return {
      disabled: current < nowTDS,
      maxDate: endDate,
    };
  },
  // 当日及以后
  DATE_AFTER: (current: number) => {
    const startDate = dayjs();

    const nowTDS = startDate.valueOf();
    return {
      disabled: current > nowTDS,
      minDate: startDate,
    };
  },
  // 当日之后禁用
  DATE_BEFORE2: (current: number) => {
    const endDate = dayjs();
    return {
      disabled: dayjs(current).isAfter(endDate, 'day'),
      maxDate: endDate,
    };
  },
  // 当日之前禁用
  DATE_AFTER2: (current: number) => {
    const startDate = dayjs();
    return {
      disabled: dayjs(current).isBefore(startDate, 'day'),
      minDate: startDate,
    };
  },
};

export const getDisabledDate = (current, rangeType) => {
  const tds = dayjs(current).valueOf();
  const func = DateRangeMap[rangeType];
  if (func) {
    const { disabled } = func(tds);
    return disabled;
  }
  return false;
};

export const getMobileDateRange = (rangeType) => {
  const func = DateRangeMap[rangeType];
  if (func) {
    const { minDate, maxDate } = func();

    return Object.assign(
      {},
      minDate && { minDate: new Date(minDate) },
      maxDate && { maxDate: new Date(maxDate) },
    );
  }
  return {};
};

export const getDefaultDate = (type, formatType: string) => {
  let defaultDate;
  switch (type) {
    case FieldSysVarDefaultValueEnum.SYS_DATE:
      defaultDate = dayjs().format(formatType ?? 'YYYY-MM-DD');
      break;
    case FieldSysVarDefaultValueEnum.SYS_DATE_TIME:
      defaultDate = dayjs().format(formatType ?? 'YYYY-MM-DD HH:mm:ss');
      break;
    case FieldSysVarDefaultValueEnum.SYS_TIME:
      defaultDate = dayjs().format(formatType ?? 'HH:mm:ss');
      break;
  }
  return defaultDate;
};
