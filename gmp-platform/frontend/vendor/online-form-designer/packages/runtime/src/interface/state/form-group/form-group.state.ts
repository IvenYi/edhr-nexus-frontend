import { IFormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单分组状态
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:49
 * @export
 * @interface IFormGroupState
 * @extends {IFormItemBasicState}
 */
export interface IFormGroupState extends IFormItemBasicState {
  /**
   * 是否在展开状态
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-01 14:04:40
   * @type {boolean}
   */
  expand: boolean;
}
