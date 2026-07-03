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
  IFormHiddenItem,
  IFormEditItemController,
} from '../../interface';
import { FormState } from '../../state';
import { QXEvent } from 'qx-util';

/**
 * 表单控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 20:04:14
 * @export
 * @class GctFormController
 * @implements {IFormController}
 */
export class GctFormController implements IFormController {
  readonly evt: QXEvent<IFormEvent> = new QXEvent();

  state: IFormState = reactive(new FormState());

  readonly item: Record<string, IFormItemBasicController> = {};

  readonly provider: Record<string, IFormItemProvider> = {};

  readonly context: IParams = {};

  readonly params: IParams = {};

  /**
   * 所有属性的项标识，由 item 和 hidden 类型的表单项的 name 组成
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:20
   * @protected
   * @type {string[]}
   */
  protected fields: string[] = [];

  /**
   * 所有[item、hidden]表单项的映射，key 为表单项的 name
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:39
   * @protected
   * @type {(Record<string, IFormItem | IFormHiddenItem>)}
   */
  protected modelMap: Record<string, IFormItem | IFormHiddenItem> = {};

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
    this.calcState();
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
   * 计算表单状态，数据变更或加载数据后调用
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:15
   * @protected
   */
  protected calcState(): void {}

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
      // 将所有数据项过滤出
      if (model.type === 'item' || model.type === 'hidden') {
        this.fields.push(model.name);
        this.modelMap[model.name] = model as IFormItem | IFormHiddenItem;
      }
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
        this.item[item.name] = provider.createController(this, item);
      } else if (model.type === 'hidden') {
        const hidden = model as IFormHiddenItem;
        this.item[hidden.name] = provider.createController(this, hidden);
      } else if (
        model.type === 'container' ||
        (model as any).isContainer ||
        (model as any).container
      ) {
        const container = model as IFormContainer;
        this.item[model.name] = provider.createController(this, container);
        if (container.children) {
          this.initFormItems(container.children);
        }
      }
    });
  }

  /**
   * 计算表单项隐藏
   *
   * @author zhanghanrui
   * @date 2024-08-01 11:08:23
   * @protected
   */
  protected calcHidden(): void {
    const keys = Object.keys(this.item);
    keys.forEach((key) => {
      const c = this.item[key] as IFormEditItemController;
      if (c.model.hidden) {
        const bol = c.model.hidden(this, c, this.state.data);
        if (bol != null) {
          // const oldState = c.state.visible;
          c.state.visible = !bol;
          // c.stateChange('visible', c.state.visible, oldState);
        }
      }
    });
  }

  /**
   * 获取当前表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:16
   * @return {*}  {IData}
   */
  getData(): IData {
    const data: IData = {};
    this.fields.forEach((field) => {
      const c = this.item[field] as IFormEditItemController;
      if (
        c &&
        (c.state.visible === true || c.model.type === 'hidden' || field.indexOf('.') !== -1)
      ) {
        setValue(c.value, c.key, data);
      }
    });
    return data;
  }

  /**
   * 重置表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:11
   */
  resetData(): void {
    this.fields.forEach((key) => {
      const c = this.item[key] as IFormEditItemController;
      if (c) {
        c.reset();
      }
    });
  }

  async load(): Promise<IData> {
    try {
      if (!this.model.loadRequest) {
        return {};
      }
      this.state.loading = true;
      const data = await this.model.loadRequest({ id: this.context.id });
      this.fields.forEach((key) => {
        const c = this.item[key] as IFormEditItemController;
        if (c) {
          c.value = data[c.key];
        }
        // 根据情况设置默认值
        c.defaultValue();
      });
      this.state.loaded = true;
      return data;
    } finally {
      this.state.loading = false;
    }
  }

  destroy(): void {
    this.state.destroyed = true;
    this.evt.reset();
    this.fields.forEach((key) => {
      const c = this.item[key];
      if (c) {
        c.destroy();
      }
    });
  }

  validate(): Promise<boolean> {
    // validate
    return Promise.resolve(true);
  }

  validateItem(_key: string): Promise<boolean> {
    // validateItem
    return Promise.resolve(true);
  }

  loaded(): void {
    // loaded
    this.calcHidden();
    this.fields.forEach((key) => {
      const c = this.item[key] as IFormEditItemController;
      // 根据情况设置默认值
      c.defaultValue();
    });
    this.calcState();
  }

  mounted(): void {
    // mounted
  }
}
function setValue(value: any, name: string, data: object) {
  const key_list = name.split('.');
  const len = key_list.length - 1;
  key_list.reduce((memo, cur, index) => {
    if (index === len) {
      memo[cur] = value;
    } else if (!memo[cur]) {
      memo[cur] = {};
    }
    return memo[cur];
  }, data);
}
