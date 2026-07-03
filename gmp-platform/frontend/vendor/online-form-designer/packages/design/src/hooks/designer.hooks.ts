import { SyncSeriesHook } from 'qx-util';

/**
 * 设计界面钩子
 *
 * @export
 * @class DesignViewHooks
 */
export class DesignViewHooks {
  /**
   * 触发执行设计容器扩容展示
   *
   * @static
   */
  expansion = new SyncSeriesHook<[], string[]>();
}
