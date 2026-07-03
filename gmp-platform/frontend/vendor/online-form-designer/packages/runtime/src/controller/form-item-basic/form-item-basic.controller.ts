import { reactive } from 'vue';
import {
  IFormController,
  IFormItemBasic,
  IFormItemBasicController,
  IFormItemBasicState,
} from '../../interface';
import { FormItemBasicState } from '../../state';

/**
 * 表单项基础控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:08
 * @export
 * @abstract
 * @class FormItemBasicController
 * @implements {IFormItemBasicController}
 */
export abstract class FormItemBasicController implements IFormItemBasicController {
  /**
   * 表单项类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:45
   * @abstract
   * @type {string}
   */
  abstract readonly type: string;

  /**
   * 表单项基础状态
   *
   * @description 禁止直接重写new实例，如果要覆盖重写 crateItemState 方法
   * @author zhanghanrui
   * @date 2024-04-02 22:04:07
   * @type {IFormItemBasicState}
   */
  state: IFormItemBasicState = this.crateItemState();

  get data(): any {
    return this.form.state.data;
  }

  /**
   * Creates an instance of FormItemBasicController.
   *
   * @author zhanghanrui
   * @date 2024-04-02 09:04:55
   * @param {IFormController} form
   * @param {IFormItemBasic} model
   */
  constructor(
    protected readonly form: IFormController,
    public readonly model: IFormItemBasic,
  ) {
    this.init();
  }

  protected init(): void {}

  // stateChange(stateKey: string, newState: any, oldState: any): void {
  //   if (this.model.state && oldState !== newState) {
  //     this.model.state(stateKey, newState, oldState, this.form, this, this.data);
  //   }
  // }

  destroy(): void {
    this.state.destroyed = true;
  }

  protected crateItemState(): IFormItemBasicState {
    return new FormItemBasicState();
  }
}

/**
 * 加载表单项控制器实例
 *
 * @author zhanghanrui
 * @date 2024-04-02 22:04:51
 * @export
 * @template T
 * @param {() => T} fn
 * @return {*}  {T}
 */
export function useFormItemController<
  T extends IFormItemBasicController = IFormItemBasicController,
>(fn: () => T): T {
  const c = fn();
  c.state = reactive(c.state);
  return c;
}
