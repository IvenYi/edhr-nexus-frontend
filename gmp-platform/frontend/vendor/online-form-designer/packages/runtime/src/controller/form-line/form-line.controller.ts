import { IFormLine, IFormLineController, IFormLineState } from '../../interface';
import { FormLineState } from '../../state';
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
export class FormLineController extends FormItemBasicController implements IFormLineController {
  override readonly type = 'line';

  declare model: IFormLine;

  declare state: IFormLineState;

  protected override crateItemState(): IFormLineState {
    return new FormLineState();
  }
}
