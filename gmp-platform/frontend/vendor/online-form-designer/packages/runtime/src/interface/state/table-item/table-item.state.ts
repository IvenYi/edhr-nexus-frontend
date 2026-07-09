/**
 *
 *
 * @author zhanghanrui
 * @date 2024-04-16 20:04:17
 * @export
 * @interface ITableItemState
 */
export interface ITableItemState {
  /**
   * 是否显示
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-16 20:04:39
   * @type {boolean}
   */
  visible: boolean;

  /**
   * 是否保活隐藏，保活隐藏使用css，否则直接不绘制。
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-17 13:04:59
   * @type {boolean}
   */
  keepalive: boolean;
}
