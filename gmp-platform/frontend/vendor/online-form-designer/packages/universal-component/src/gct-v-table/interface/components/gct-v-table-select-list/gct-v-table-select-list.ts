/**
 * 选择列表项数据结构
 *
 * @export
 * @interface ISelectListItem
 */
export interface ISelectListItem extends IObject {
  /**
   * 选项的显示文本
   *
   * @type {string}
   */
  label: string;
  /**
   * 选项的图标（可选）
   *
   * @type {string}
   */
  icon?: string;
}

/**
 * 选择列表悬浮呈现组件
 *
 * @export
 * @interface GctVTableSelectListProps
 */
export interface GctVTableSelectListProps {
  /**
   * 需要展示的选项列表
   *
   * @type {ISelectListItem[]}
   */
  items: ISelectListItem[];

  /**
   * 每个选项最大显示的字符数，超出部分用省略号表示
   * 默认为 12
   *
   * @type {number}
   */
  maxTextLength?: number;
}
