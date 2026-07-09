import { reactive } from 'vue';
import {
  IForm,
  IFormState,
  IFormController,
  IFormItemBasic,
  IFormContainer,
  IFormItem,
  IFormItemProvider,
  IFormItemBasicController,
  IFormEvent,
} from '../../interface';
import { FormState } from '../../state';
import { QXEvent } from 'qx-util';

/**
 * 表单控制器
 *
 * @author zhanghanrui
 * @date 2024-03-27 09:03:56
 * @export
 * @class FormController
 */
export class FormController {
  readonly evt: QXEvent<IFormEvent> = new QXEvent();

  state: IFormState = reactive(new FormState());

  item: Record<string, IFormItemBasicController> = {};

  provider: Record<string, IFormItemProvider> = {};

  constructor(public readonly model: IForm) {
    this.init();
  }

  /**
   * 表单初始化
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:27
   * @protected
   */
  protected init(): void {
    if (this.model.children) {
      this.initFormItems(this.model.children);
    }
    this.initEvent();
  }

  /**
   * 初始化表单事件订阅相关
   *
   * @author zhanghanrui
   * @date 2024-04-02 14:04:31
   * @protected
   */
  protected initEvent(): void {}

  /**
   * 初始化表单项控制器
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:38
   * @protected
   * @param {IFormItemBasic[]} models
   */
  protected initFormItems(models: IFormItemBasic[]): void {
    models.forEach((model) => {
      let provider: IFormItemProvider | null = null;
      if (model.type === 'item') {
        // 优先使用[表单项类型+编辑器类型+字段名]查找适配器
        provider = gct.register.formItem.create(
          `${model.type}___${(model as IFormItem).editor.type}___${(model as IFormItem).name}`,
        );
        if (!provider) {
          // 使用[表单项类型+编辑器类型]查找适配器
          provider = gct.register.formItem.create(
            `${model.type}___${(model as IFormItem).editor.type}`,
          );
        }
      }
      if (!provider) {
        // 使用表单项类型查找适配器
        provider = gct.register.formItem.create(model.type);
      }
      if (!provider) {
        console.error(`未找到表单项提供者：${model.type}`, model);
        return;
      }
      // 缓存适配器实例
      this.provider[model.name] = provider;

      if (model.type === 'item') {
        const item = model as IFormItem;
        this.item[item.name] = provider.createController(this as any, model as IFormItem);
      } else if (model.type === 'container') {
        const container = model as IFormContainer;
        this.item[model.name] = provider.createController(this as any, model as IFormContainer);
        if (container.children) {
          this.initFormItems(container.children);
        }
      }
    });
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
    if (this.model.fields) {
      this.model.fields.forEach((field: string) => {
        if (this.state.data[field] != null) {
          data[field] = this.state.data[field];
        }
      });
    }
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
export function useFormController(model: IForm): IFormController {
  const c = new FormController(model);
  c.state = reactive(c.state);
  return c as unknown as IFormController;
}
