/**
 * 字段上下文菜单项
 *
 * @export
 * @interface IFieldContextItem
 */
export interface IFieldContextItem {
  /**
   * 项类型，分为直接行为和选择器
   *
   * @type {('action' | 'select' | 'select-item' | 'group' | 'group-item')}
   */
  mode: 'action' | 'select' | 'select-item' | 'group' | 'group-item';
  /**
   * 标题
   *
   * @type {string}
   */
  label: string;
  /**
   * select 模式下必填，对应数据中的标识
   *
   * @type {string}
   */
  fieldKey?: string;
  /**
   * select 模式下必填，填入数据中的值
   *
   * @type {string}
   */
  value?: string;
  /**
   * 必填唯一标识
   *
   * @type {string}
   */
  name: string;
  /**
   * mode=action 模式下生效。点击事件，有默认处理，当实现此方法时，默认处理失效
   *
   * @param {IFieldContextItem} action
   * @param {IObject} data
   */
  click?(action: IFieldContextItem, data: IObject): void;
  /**
   * 子项
   *
   * @type {IFieldContextItem[]}
   */
  children?: IFieldContextItem[];
  /**
   * ICON
   */
  icon?: string;
}
