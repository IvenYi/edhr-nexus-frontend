/**
 * 数据字典项
 *
 * @author zhanghanrui
 * @date 2024-07-29 11:07:41
 * @export
 * @interface IDictionaryItem
 */
export interface IDictionaryItem {
  /**
   * 名称
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:41
   * @type {string}
   */
  label: string;

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
   * @date 2024-10-16 09:10:39
   * @type {boolean}
   */
  disabled?: boolean;

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

/**
 * 数据字典配置
 *
 * @author zhanghanrui
 * @date 2024-04-02 21:04:01
 * @export
 * @interface IDictionary
 * @extends {ICodeList}
 */
export interface IDictionary {
  /**
   * 代码表标识
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:25
   * @type {string}
   */
  tag: string;

  /**
   * 代码表模式
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:09
   * @type {('static' | 'async')} static: 静态 async: 异步
   */
  mode: 'static' | 'async';

  /**
   * 用于异步代码表获取
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:25
   * @param {IParams} params
   * @return {*}  {Promise<IData[]>}
   */
  fetch?(params: IParams): Promise<IData[]>;

  /**
   * 指定数据字典项的键值属性，动态代码表需要。若不配置动态代码表默认取 id 和 name
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:06
   * @type {[labelKey: string, valueKey: string]}
   */
  keys?: [labelKey: string, valueKey: string];

  /**
   * 代码表项
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:29
   * @type {IDictionaryItem[]}
   */
  items?: IDictionaryItem[];
}
