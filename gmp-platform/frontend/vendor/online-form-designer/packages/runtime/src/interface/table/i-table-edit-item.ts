import { RuleObject } from 'ant-design-vue/es/form';
import { IEditorBasic } from '../form';
import { IDictionary } from '../i-code-list/i-code-list';
import { ITableItem } from './i-table-item';

/**
 * 表格编辑项
 *
 * @author zhanghanrui
 * @date 2024-04-15 18:04:36
 * @export
 * @interface ITableEditItem
 * @extends {ITableItem}
 */
export interface ITableEditItem extends ITableItem {
  /**
   * 编辑项
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:42
   * @type {'edit'}
   */
  type: 'edit';

  /**
   * 是否只读，默认不启用只读
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-16 20:04:14
   * @type {boolean}
   */
  readonly?: boolean;

  /**
   * 是否禁用，默认不禁用
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-16 20:04:35
   * @type {boolean}
   */
  disabled?: boolean;

  /**
   * 值规则
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:52
   * @type {RuleObject[]}
   */
  rules?: RuleObject[];

  /**
   * 代码表标识
   *
   * @description 用于从全局获取代码表的标识
   * @author zhanghanrui
   * @date 2024-04-15 18:04:56
   * @type {string}
   */
  dictionaryTag?: string;

  /**
   * 代码表（数据字典），优先级高于 codeTag
   *
   * @author zhanghanrui
   * @date 2024-04-15 18:04:07
   * @type {IDictionary}
   */
  dictionary?: IDictionary;

  /**
   * 编辑器
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:56
   * @type {IEditorBasic}
   */
  editor: IEditorBasic;
}
