import { ICodeItem, IDictionaryItem } from './i-code-item';

/**
 * 代码表配置
 *
 * @author zhanghanrui
 * @date 2024-03-27 13:03:30
 * @export
 * @interface ICodeList
 */
export interface ICodeList {
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
   * 代码表项
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:37
   * @type {ICodeItem[]}
   */
  items?: ICodeItem[];

  /**
   * 用于异步代码表获取
   *
   * @author zhanghanrui
   * @date 2024-03-27 13:03:25
   * @param {IParams} params
   * @return {*}  {Promise<IData[]>}
   */
  fetch?(params: IParams): Promise<IData[]>;
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
export interface IDictionary extends ICodeList {
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
