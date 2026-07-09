import { IFormContainer } from './i-form-container';

/**
 * 表单
 *
 * @author zhanghanrui
 * @date 2024-03-26 20:03:14
 * @export
 * @interface IForm
 */
export interface IForm {
  /**
   * 表单类型
   *
   * @author zhanghanrui
   * @date 2024-03-27 11:03:21
   * @type {('edit' | 'search')} 编辑表单 | 搜索表单
   */
  type: 'edit' | 'search';

  /**
   * 表单布局方式
   *
   * @author zhanghanrui
   * @date 2024-04-08 13:04:59
   * @type {('horizontal' | 'vertical' | 'inline')}
   */
  layout?: 'horizontal' | 'vertical' | 'inline';

  /**
   * 是否为信息表单，只读模式
   *
   * @author zhanghanrui
   * @date 2024-04-08 14:04:13
   * @type {boolean}
   */
  info?: boolean;

  /**
   * 空数据时是否显示提示文本
   *
   * @type {boolean}
   */
  isEmptyText?: boolean;

  /**
   * 表单呈现大小大小
   *
   * @type {('small' | 'medium' | 'large')}
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 不显示[冒号]
   *
   * @description 默认显示冒号
   * @default false
   * @author zhanghanrui
   * @date 2024-07-29 15:07:52
   * @type {boolean}
   */
  noColon?: boolean;

  /**
   * 表单项标题默认宽度
   *
   * @author zhanghanrui
   * @date 2024-04-02 09:04:44
   * @type {string}
   */
  labelWidth?: string | number;

  /**
   * 表单所有字段
   *
   * @deprecated
   * @author zhanghanrui
   * @date 2024-03-27 15:03:18
   * @type {string[]}
   */
  fields?: string[];

  /**
   * 表单项
   *
   * @author zhanghanrui
   * @date 2024-03-26 20:03:39
   * @type {IFormContainer[]}
   */
  children: IFormContainer[];

  /**
   * 加载数据
   *
   * @author zhanghanrui
   * @date 2024-04-03 16:04:27
   * @param {{ id: string }} params
   * @return {*}  {Promise<IData>}
   */
  loadRequest?(params: { id: string }): Promise<IData>;
}
