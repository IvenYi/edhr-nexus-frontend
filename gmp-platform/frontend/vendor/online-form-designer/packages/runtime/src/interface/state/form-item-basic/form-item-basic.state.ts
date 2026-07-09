/**
 * 表单项状态基础
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:21
 * @export
 * @interface IFormItemBasicState
 */
export interface IFormItemBasicState {
  /**
   * 表单项类型
   *
   * @author zhanghanrui
   * @date 2024-04-02 14:04:44
   * @type {string}
   */
  type?: string;

  /**
   * 是否禁用
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-02 13:04:22
   * @type {boolean}
   */
  disabled: boolean;

  /**
   * 是否只读
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-02 13:04:35
   * @type {boolean}
   */
  readonly?: boolean;

  /**
   * 是否显示(keepalive=true时v-show模式，keepalive=false时v-if模式)
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-02 13:04:07
   * @type {boolean}
   */
  visible: boolean;

  /**
   * 是否在隐藏时保持绘制
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-02 13:04:45
   * @type {boolean}
   */
  keepalive?: boolean;

  /**
   * 是否已经销毁
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-03 16:04:35
   * @type {boolean}
   */
  destroyed: boolean;
}
