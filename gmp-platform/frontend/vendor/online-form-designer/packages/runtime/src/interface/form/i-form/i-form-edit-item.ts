import { RuleObject } from 'ant-design-vue/lib/form';
import { IDictionary } from '../../i-code-list/i-code-list';
import { IEditorBasic } from '../i-editor/i-editor-basic';
import { IFormItemBasic } from './i-form-item-basic';

/**
 * 表单编辑项
 *
 * @author zhanghanrui
 * @date 2024-04-02 20:04:09
 * @export
 * @interface IFormEditItem
 * @extends {IFormItemBasic}
 */
export interface IFormEditItem extends IFormItemBasic {
  /**
   * 项类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:44
   * @type {'item'}
   */
  type: 'item' | 'hidden';

  /**
   * 表单项标识
   *
   * @author zhanghanrui
   * @date 2024-03-27 09:03:25
   * @type {string}
   */
  name: string;

  /**
   * 是否隐藏错误信息的高度空间
   *
   * @type {boolean}
   */
  hiddenError?: boolean;

  /**
   * 表单项映射字段（用于提交数据，未指定时取 name）
   *
   * @author zhanghanrui
   * @date 2024-04-03 10:04:17
   * @type {string}
   */
  field?: string;

  /**
   * 默认值
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:11
   * @type {*}
   */
  defaultValue?: any;

  /**
   * 编辑器
   *
   * @author zhanghanrui
   * @date 2024-03-27 09:03:57
   * @type {IEditorBasic}
   */
  editor: IEditorBasic;

  /**
   * 标题
   *
   * @author zhanghanrui
   * @date 2024-03-27 09:03:50
   * @type {string}
   */
  label?: string;

  /**
   * 标题后面加个问号的tooltip
   *
   * @author zhanghanrui
   * @date 2024-03-27 09:03:50
   * @type {string}
   */
  labelTooltip?: string;

  /**
   * 标题提示宽度
   *
   * @author chitanda
   * @date 2025-07-04 16:07:57
   * @type {string}
   */
  labelTipWidth?: string;

  /**
   * 标题宽度
   *
   * @author zhanghanrui
   * @date 2024-04-02 09:04:52
   * @type {string}
   */
  labelWidth?: string;

  /**
   * 标题位置
   * @author lingxiaoming
   * @date 2024-07-18 11:36:31
   * @type {('left' | 'top')}
   */
  labelPosition?: 'left' | 'top';

  /**
   * 开启后label不显示冒号
   * @author lingxiaoming
   * @date 2024-07-18 03:55:12
   * @type {boolean}
   */
  noColon?: boolean;

  /**
   * label文字的对齐方式,默认right
   * @author lingxiaoming
   * @date 2024-07-18 03:56:31
   * @type {('left' | 'right')}
   */
  labelAlign?: 'left' | 'right';

  /**
   * 编辑器的对齐方式,默认left
   * @author lingxiaoming
   * @date 2024-07-18 03:56:31
   * @type {('left' | 'right')}
   */
  editorAlign?: 'left' | 'right';

  /**
   * 属性项
   *
   * @author zhanghanrui
   * @date 2024-03-27 14:03:29
   * @type {string[]}
   */
  fields?: string[];

  /**
   * 表单项规则
   *
   * @author zhanghanrui
   * @date 2024-04-01 19:04:48
   * @type {RuleObject[]}
   */
  rules?: RuleObject[];

  /**
   * 代码表标识
   *
   * @description 用于从全局获取代码表的标识
   * @author zhanghanrui
   * @date 2024-04-02 21:04:06
   * @type {string}
   */
  dictionaryTag?: string;

  /**
   * 代码表（数据字典），优先级高于 codeTag
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:58
   * @type {IDictionary}
   */
  dictionary?: IDictionary;
}
