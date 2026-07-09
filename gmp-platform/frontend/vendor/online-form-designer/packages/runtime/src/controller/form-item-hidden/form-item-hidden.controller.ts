import { IFormHiddenItem, IFormHiddenItemController, IFormHiddenItemState } from '../../interface';
import { FormEditItemController } from '../form-edit-item/form-edit-item.controller';

/**
 * 表单分组控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:00
 * @export
 * @class FormHiddenItemController
 * @extends {FormEditItemController}
 * @implements {IFormGroupController}
 */
export class FormHiddenItemController
  extends FormEditItemController
  implements IFormHiddenItemController
{
  override readonly type = 'hidden';

  declare model: IFormHiddenItem;

  declare state: IFormHiddenItemState;
}
