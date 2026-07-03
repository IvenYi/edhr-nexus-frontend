import { IFormEditItemState } from '../form-edit-item/form-edit-item.state';

/**
 * 表单项状态
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:34
 * @export
 * @interface IFormItemState
 * @extends {IFormEditItemState}
 */
export interface IFormItemState extends IFormEditItemState {
  /**
   * 表单项标签
   *
   * @author zhanghanrui
   * @date 2024-04-01 11:04:13
   * @type {string}
   */
  label?: string;
}
