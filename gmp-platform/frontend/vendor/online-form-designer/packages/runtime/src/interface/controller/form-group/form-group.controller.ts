import { IFormGroup } from '../../form';
import { IFormGroupState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分组
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:04
 * @export
 * @interface IFormGroupController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormGroupController<
  M extends IFormGroup = IFormGroup,
  S extends IFormGroupState = IFormGroupState,
> extends IFormItemBasicController<M, S> {
  /**
   * 分组类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:50
   * @type {'group'}
   */
  type: 'group';
}
