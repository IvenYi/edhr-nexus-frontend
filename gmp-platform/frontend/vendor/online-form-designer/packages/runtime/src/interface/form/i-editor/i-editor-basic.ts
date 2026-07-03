import { StyleValue } from 'vue';
import { IFormEditItemController } from '../../controller';
import { ICodeList } from '../../i-code-list/i-code-list';
import { IEditorProvider } from '../../provider';
import { IFormItem } from '../i-form/i-form-item';

/**
 * 编辑器基础接口
 *
 * @author zhanghanrui
 * @date 2024-03-27 09:03:59
 * @export
 * @interface IEditorBasic
 */
export interface IEditorBasic {
  /**
   * 编辑器类型
   *
   * @author zhanghanrui
   * @date 2024-04-02 17:04:57
   * @type {string}
   */
  type: string;

  /**
   * 输入框占提示位符
   *
   * @author zhanghanrui
   * @date 2024-04-02 11:04:14
   * @type {string}
   */
  placeholder?: string;

  /**
   * 格式化配置
   *
   * @author zhanghanrui
   * @date 2024-04-08 15:04:01
   */
  format?: string | ((data: IData, model: IFormItem, c: IFormEditItemController) => string);

  /**
   * 是否只读模式
   *
   * @author zhanghanrui
   * @date 2024-04-08 14:04:48
   * @type {boolean}
   */
  readonly?: boolean;

  /**
   * 是否默认为禁用状态
   *
   * @author zhanghanrui
   * @date 2024-04-11 09:04:09
   * @type {boolean}
   */
  disabled?: boolean;

  /**
   * 编辑器高度
   *
   * @author zhanghanrui
   * @date 2024-04-02 16:04:18
   * @type {string}
   */
  height?: string;

  /**
   * 编辑器宽度
   *
   * @author zhanghanrui
   * @date 2024-04-02 16:04:22
   * @type {string}
   */
  width?: string;

  /**
   * 最大字符或值
   *
   * @author zhanghanrui
   * @date 2024-04-02 16:04:35
   * @type {number}
   */
  max?: number;

  /**
   * 最小字符或值
   *
   * @author zhanghanrui
   * @date 2024-04-02 16:04:45
   * @type {number}
   */
  min?: number;

  /**
   * 额外的编辑器参数
   *
   * @author zhanghanrui
   * @date 2024-03-27 15:03:16
   * @type {*}
   */
  props?: any;

  /**
   * 定制化编辑器适配器
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:25
   * @type {IEditorProvider}
   */
  provider?: IEditorProvider;

  /**
   * 代码表标识
   *
   * @description 用于从全局获取代码表的标识
   * @deprecated
   * @author zhanghanrui
   * @date 2024-03-27 13:03:47
   * @type {ICodeList[]}
   */
  codeTag?: string;

  /**
   * 代码表（数据字典），优先级高于 codeTag
   *
   * @deprecated
   * @author zhanghanrui
   * @date 2024-04-02 09:04:28
   * @type {ICodeList}
   */
  codeList?: ICodeList;

  /**
   * 额外的类名
   * @author lingxiaoming
   * @date 2024-07-18 01:05:19
   * @type {*}
   */
  class?: any;

  /**
   * 额外行内的样式
   * @author lingxiaoming
   * @date 2024-07-18 01:05:33
   * @type {StyleValue}
   */
  style?: StyleValue;
}
