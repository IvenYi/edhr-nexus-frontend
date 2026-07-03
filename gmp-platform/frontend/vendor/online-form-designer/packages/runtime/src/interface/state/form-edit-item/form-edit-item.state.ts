import { IDictionaryItem } from '../../i-code-list/i-code-item';
import { IFormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单编辑项状态
 *
 * @author zhanghanrui
 * @date 2024-04-02 21:04:39
 * @export
 * @interface IFormEditItemState
 * @extends {IFormItemBasicState}
 */
export interface IFormEditItemState extends IFormItemBasicState {
  /**
   * 是否加载中，用于异步加载数据类似代码表
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-02 21:04:43
   * @type {boolean}
   */
  loading?: boolean;

  /**
   * 当前项的值，用于触发界面刷新
   *
   * @author zhanghanrui
   * @date 2024-04-02 22:04:18
   * @type {*}
   */
  value?: any;

  /**
   * 代码表项
   *
   * @author zhanghanrui
   * @date 2024-04-03 14:04:14
   * @type {IDictionaryItem[]}
   */
  options: IDictionaryItem[];
}
