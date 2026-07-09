import { IFormCollapsePane, IFormCollapsePaneController, IFormCollapsePaneState } from '../../interface';
import { FormCollapsePaneState } from '../../state';
import { FormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单折叠面板项控制器
 *
 * @author lxm
 * @date 2024-07-15 09:07:23
 * @export
 * @class FormCollapsePaneController
 * @extends {FormItemBasicController}
 * @implements {IFormCollapsePaneController}
 */
export class FormCollapsePaneController
  extends FormItemBasicController
  implements IFormCollapsePaneController
{
  override readonly type = 'collapse-pane';

  declare model: IFormCollapsePane;

  declare state: IFormCollapsePaneState;

  protected override crateItemState(): IFormCollapsePaneState {
    return new FormCollapsePaneState();
  }
}
