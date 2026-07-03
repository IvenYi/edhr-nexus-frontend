import { reactive, onUnmounted } from 'vue';
import { IEditForm, IEditFormController, IFormEditItemController } from '../../interface';
import { GctFormController } from '../gct-form/gct-form.controller';

/**
 * 编辑表单控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 18:04:45
 * @export
 * @class EditFormController
 * @extends {GctFormController}
 * @implements {IEditFormController}
 */
export class EditFormController extends GctFormController implements IEditFormController {
  declare model: IEditForm;

  protected override initEvent(): void {
    super.initEvent();
    this.evt.on('change', (key, val, oldVal) => {
      if (this.model.watch) {
        const fun = this.model.watch![key];
        if (fun) {
          fun(this, val, oldVal);
        }
      }
      const item = this.item[key];
      if (item && item.model.watch) {
        item.model.watch!(this, item as IFormEditItemController, val, oldVal);
      }
      if (item && item.model.change) {
        item.model.change!(this, item as IFormEditItemController, this.state.data);
      }
      if (val != oldVal) {
        this.calcHidden();
      }
    });
  }

  save(): Promise<IData> {
    const data = this.getData();
    if (this.state.isNew === true && this.model.newRequest) {
      return this.model.newRequest(data);
    }
    if (this.model.updateRequest) {
      return this.model.updateRequest({ id: this.context.id }, data);
    }
    return Promise.resolve(data);
  }
}

/**
 * 获取编辑表单控制器实例
 *
 * @author zhanghanrui
 * @date 2024-04-01 18:04:13
 * @export
 * @param {IEditForm} model
 * @return {*}  {EditFormController}
 */
export function useEditFormController(fn: () => EditFormController): EditFormController {
  const c = fn();
  c.state = reactive(c.state);
  onUnmounted(() => c.destroy());
  return c;
}
