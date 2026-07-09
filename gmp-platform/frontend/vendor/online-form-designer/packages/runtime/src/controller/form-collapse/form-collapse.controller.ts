import { IFormCollapse, IFormCollapseController, IFormCollapseState } from '../../interface';
import { FormCollapseState } from '../../state';
import { FormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单折叠面板控制器
 *
 * @author lxm
 * @date 2024-07-15 09:07:23
 * @export
 * @class FormCollapseController
 * @extends {FormItemBasicController}
 * @implements {IFormCollapseController}
 */
export class FormCollapseController
  extends FormItemBasicController
  implements IFormCollapseController
{
  override readonly type = 'collapse';

  declare model: IFormCollapse;

  declare state: IFormCollapseState;

  protected override crateItemState(): IFormCollapseState {
    return new FormCollapseState();
  }
}
