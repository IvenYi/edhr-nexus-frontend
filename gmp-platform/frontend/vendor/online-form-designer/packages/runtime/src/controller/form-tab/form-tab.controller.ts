import { IFormTab, IFormTabController, IFormTabState } from '../../interface';
import { FormTabState } from '../../state';
import { FormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分组控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:00
 * @export
 * @class FormTabController
 * @extends {FormItemBasicController}
 * @implements {IFormTabController}
 */
export class FormTabController extends FormItemBasicController implements IFormTabController {
  override readonly type = 'tab';

  declare model: IFormTab;

  declare state: IFormTabState;

  protected override crateItemState(): IFormTabState {
    return new FormTabState();
  }
}
