import { IFormTabPane, IFormTabPaneController, IFormTabPaneState } from '../../interface';
import { FormTabPaneState } from '../../state';
import { FormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分组控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:00
 * @export
 * @class FormTabPaneController
 * @extends {FormItemBasicController}
 * @implements {IFormTabPaneController}
 */
export class FormTabPaneController
  extends FormItemBasicController
  implements IFormTabPaneController
{
  override readonly type = 'tab-pane';

  declare model: IFormTabPane;

  declare state: IFormTabPaneState;

  protected override crateItemState(): IFormTabPaneState {
    return new FormTabPaneState();
  }
}
