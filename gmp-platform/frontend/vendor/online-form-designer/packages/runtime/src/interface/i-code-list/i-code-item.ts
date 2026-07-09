/**
 * 代码表项
 *
 * @author zhanghanrui
 * @date 2024-03-27 13:03:24
 * @export
 * @interface ICodeItem
 */
export interface ICodeItem {
  /**
   * 名称
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:41
   * @type {string}
   */
  label: string;
  /**
   * 图标
   *
   * @type {string}
   */
  icon?: string;
  /**
   * 激活图标
   *
   * @type {string}
   */
  activeIcon?: string;
  /**
   * 提示信息
   *
   * @type {string}
   */
  tooltip?: string;
  /**
   * 值
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:46
   * @type {(string | number)}
   */
  value: string | number;
  /**
   * 是否禁用
   *
   * @author zhanghanrui
   * @date 2024-10-16 09:10:22
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * 可以树形嵌套的子项
   *
   * @author zhanghanrui
   * @date 2024-04-02 09:04:16
   * @type {ICodeItem[]}
   */
  children?: ICodeItem[];
}

/**
 * 数据字典项
 *
 * @author zhanghanrui
 * @date 2024-04-02 21:04:23
 * @export
 * @interface IDictionaryItem
 * @extends {ICodeItem}
 */
export interface IDictionaryItem extends ICodeItem {
  data?: IObject;

  /**
   * 递归子项
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:31
   * @type {IDictionaryItem[]}
   */
  options?: IDictionaryItem[];

  /**
   * 递归子项
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:31
   * @type {IDictionaryItem[]}
   */
  children?: IDictionaryItem[];
}
