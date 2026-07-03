/**
 * 行为项
 *
 * @author zhanghanrui
 * @date 2024-07-16 16:07:55
 * @export
 * @interface IDesignItemAction
 */
export interface IDesignItemAction {
  /**
   * 行为标识
   *
   * @author zhanghanrui
   * @date 2024-07-16 16:07:00
   * @type {string}
   */
  tag: string;
  /**
   * 文本
   *
   * @author zhanghanrui
   * @date 2024-07-16 16:07:07
   * @type {string}
   */
  label?: string;
  /**
   * 提示
   *
   * @author zhanghanrui
   * @date 2024-07-16 16:07:11
   * @type {string}
   */
  tooltip?: string;
  /**
   * 图标(目前只支持 iconfont)
   *
   * @author zhanghanrui
   * @date 2024-07-16 16:07:15
   * @type {string}
   */
  icon?: string;
}
