import { SyncSeriesHook } from 'qx-util';
import { LowCodeWidget } from '@gct/runtime';
import { IDesignerHooks } from '@gct-paas/design';

/**
 * 设计界面钩子
 *
 * @export
 * @class DesignerHooks
 */
export class DesignerHooks implements IDesignerHooks {
  /**
   * 触发执行设计容器扩容展示
   *
   * @static
   */
  expansion = new SyncSeriesHook<[], LowCodeWidget.BasicSchema[]>();

  /**
   * 触发选中项重选
   *
   */
  selectHighlightChange = new SyncSeriesHook<[]>();

  /**
   * 触发悬浮项重选
   *
   */
  hoverHighlightChange = new SyncSeriesHook<[]>();

  /**
   * 设置选中项
   *
   */
  setSelect = new SyncSeriesHook<[key: string]>();
}
