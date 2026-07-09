import { IDictionaryItem, IFormItem, IFormItemController, IFormItemState } from '../../interface';
import { FormItemState } from '../../state';
import { FormEditItemController } from '../form-edit-item/form-edit-item.controller';

/**
 * 表单项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 20:04:03
 * @export
 * @class FormItemController
 * @extends {FormEditItemController}
 * @implements {IFormItemController}
 */
export class FormItemController extends FormEditItemController implements IFormItemController {
  override readonly type = 'item';

  declare model: IFormItem;

  declare state: IFormItemState;

  async loadDictionary(params?: IParams, force?: boolean): Promise<IDictionaryItem[]> {
    if (this.state.options.length > 0 && force !== true) {
      return this.state.options;
    }
    this.state.options = [];
    this.state.loading = true;
    try {
      if (this.model.dictionary) {
        this.state.options = await gct.dictionary.asyncGetByConfig(this.model.dictionary, params);
      } else if (this.model.dictionaryTag) {
        this.state.options = await gct.dictionary.asyncGet(this.model.dictionaryTag, params);
      }
      return this.state.options;
    } finally {
      this.state.loading = false;
    }
  }

  clearDictionary(): void {
    this.state.options = [];
  }

  protected override crateItemState(): IFormItemState {
    return new FormItemState();
  }
}
