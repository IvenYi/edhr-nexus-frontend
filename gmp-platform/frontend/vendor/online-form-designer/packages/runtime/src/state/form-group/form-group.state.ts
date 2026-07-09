import { IFormGroupState } from '../../interface';
import { FormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单项状态
 *
 * @author zhanghanrui
 * @date 2024-04-01 11:04:11
 * @export
 * @class FormGroupState
 * @implements {IFormItemState}
 */
export class FormGroupState extends FormItemBasicState implements IFormGroupState {
  /**
   * 是否在展开状态
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:52
   * @type {boolean}
   */
  expand: boolean = true;
}
