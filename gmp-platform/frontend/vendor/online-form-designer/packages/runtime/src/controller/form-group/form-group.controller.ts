import { IFormGroup, IFormGroupController, IFormGroupState } from '../../interface';
import { FormGroupState } from '../../state';
import { FormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分组控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:00
 * @export
 * @class FormGroupController
 * @extends {FormItemBasicController}
 * @implements {IFormGroupController}
 */
export class FormGroupController extends FormItemBasicController implements IFormGroupController {
  override readonly type = 'group';

  declare model: IFormGroup;

  declare state: IFormGroupState;

  protected override crateItemState(): IFormGroupState {
    return new FormGroupState();
  }
}
