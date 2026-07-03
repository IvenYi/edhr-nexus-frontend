export interface IActionItem {
  /**
   * 按钮文本
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:17
   * @type {string}
   */
  text: string;

  /**
   * 按钮图标
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:21
   * @type {string}
   */
  icon?: string;

  /**
   * 按钮提示
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:35
   * @type {string}
   */
  tooltip?: string;

  /**
   * 是否禁用
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:24
   * @type {boolean}
   */
  disabled?: boolean;

  /**
   * 是否正在加载中
   *
   * @author zhanghanrui
   * @date 2024-04-07 18:04:41
   * @type {boolean}
   */
  loading?: boolean;

  /**
   * 点击事件
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:28
   */
  onClick?: (() => void) | (() => Promise<void>);

  /**
   * 子按钮
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:30
   * @type {IActionItem[]}
   */
  children?: IActionItem[];

  /**
   * 按钮组件参数（目前使用 a-button 组件）
   *
   * @author zhanghanrui
   * @date 2024-04-07 17:04:44
   * @type {*}
   */
  props?: any;
}
