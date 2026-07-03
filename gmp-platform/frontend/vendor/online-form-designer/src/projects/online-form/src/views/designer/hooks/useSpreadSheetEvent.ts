import { mitt } from '/@/utils/mitt';

/**
 * 表单设计器事件类型
 * @export
 * @enum {number}
 */
export enum SpreadSheetEventType {
  /** 标签页切换 */
  SHEET_CHANGE = 'sheet_change',
}

export interface SpreadSheetEvents {
  [SpreadSheetEventType.SHEET_CHANGE]: {
    /** 要跳转的sheet页的id */
    to: string;
  };

  [k: string | number | symbol]: any;
}

const emitter = mitt<SpreadSheetEvents>();

/**
 * 使用表单设计器事件总线
 * @export
 * @return {*}
 */
export function useSpreadSheetEvent() {
  /**
   * 清空所有事件
   */
  function clear() {
    emitter.all.clear();
  }

  return {
    emitter,
    clear,
  };
}
