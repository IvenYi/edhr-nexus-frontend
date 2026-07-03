import { SyncSeriesHook } from 'qx-util';

/**
 * 表格 Popover 相关的 Hooks 定义
 *
 * @export
 * @interface ITablePopoverHooks
 */
export interface ITablePopoverHooks {
  /**
   * Popover 关闭前的 Hook，允许注册回调函数，在弹窗关闭前执行，可以通过回调参数控制是否允许关闭
   *
   * @type {SyncSeriesHook<null, { close: boolean }>}
   */
  beforeDismiss: SyncSeriesHook<null, { close: boolean }>;
}
