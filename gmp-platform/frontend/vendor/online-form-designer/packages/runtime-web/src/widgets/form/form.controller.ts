import { reactive } from 'vue';
import { IForm } from '@gct/runtime';
import { FormState } from './form.state';

/**
 * 表单控制器
 *
 * @author zhanghanrui
 * @date 2024-03-27 09:03:56
 * @export
 * @class FormController
 */
export class FormController {
  /**
   * 表单状态数据，和界面 UI 相关
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:34
   */
  state = new FormState();

  constructor(public readonly model: IForm) {
    // todo
  }

  /**
   * 获取当前表单数据
   *
   * @author zhanghanrui
   * @date 2024-03-27 18:03:33
   * @return {*}  {IData}
   */
  getData(): IData {
    const data: IData = {};
    this.model.fields.forEach((field: string) => {
      if (this.state.data[field] != null) {
        data[field] = this.state.data[field];
      }
    });
    return data;
  }

  /**
   * 重置表单数据
   *
   * @author zhanghanrui
   * @date 2024-03-27 18:03:09
   */
  resetData(): void {
    const keys = Object.keys(this.state.data);
    keys.forEach((key) => {
      const val = this.state.data[key];
      if (val) {
        if (typeof val === 'object') {
          if (Array.isArray(val)) {
            this.state.data[key] = [];
          } else {
            this.state.data[key] = {};
          }
        } else {
          this.state.data[key] = null;
        }
      }
    });
  }
}

/**
 * 获取表单控制器实例
 *
 * @author zhanghanrui
 * @date 2024-03-27 10:03:30
 * @export
 * @param {IForm} model
 * @return {*}  {FormController}
 */
export function useFormController(model: IForm): FormController {
  const c = new FormController(model);
  c.state = reactive(c.state);
  return c;
}
