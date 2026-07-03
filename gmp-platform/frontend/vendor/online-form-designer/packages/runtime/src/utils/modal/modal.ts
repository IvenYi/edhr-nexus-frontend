import { reactive } from 'vue';
/* eslint-disable no-await-in-loop */
import { AsyncSeriesHook } from 'qx-util';
import { IModal, IModalData } from '../../interface';

type ConstructorOpts = {
  /**
   * 注入的模态等组件实际的关闭操作，
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:00
   */
  dismiss?: (data: IModalData) => void;
  /**
   * 修改属性
   * @param data
   * @returns
   */
  setOptions?: (data: object) => void;
};
export class Modal implements IModal {
  ignoreDismissCheck = false;

  state: { okDisabled?: boolean; cancelDisabled?: boolean; } = reactive({
    okDisabled: false,
    cancelDisabled: false,
  });

  hooks = {
    shouldDismiss: new AsyncSeriesHook<[], { allowClose?: boolean }>(),
    beforeDismiss: new AsyncSeriesHook<[], IModalData>(),
  };

  ok?: () => Promise<IModalData | null>;

  setOptions?: (options: object) => void;

  constructor(opts: ConstructorOpts) {
    if (opts.dismiss) {
      this._dismiss = opts.dismiss;
    }
    if (opts.setOptions) {
      this.setOptions = opts.setOptions;
    }
  }

  cancel?: (() => Promise<boolean>) | undefined;

  callback(ok?: () => Promise<IModalData | null>, cancel?: () => Promise<boolean>): void {
    if (ok) {
      this.ok = ok;
    }
    if (cancel) {
      this.cancel = cancel;
    }
  }

  /**
   * 外部注入的模态等组件实际的关闭操作
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:08
   * @param {IModalData} data
   */
  _dismiss = (data: IModalData): void => {
    console.warn('外部关闭能力未注册', data);
  };

  /**
   * 注入模态等组件实际的关闭操作
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:13
   * @param {(data: IModalData) => void} dismiss
   */
  injectDismiss(dismiss: (data: IModalData) => void): void {
    this._dismiss = dismiss;
  }

  async dismiss(data: IModalData = { ok: false, data: [] }): Promise<boolean> {
    const context: IData = {};
    if (this.ignoreDismissCheck !== true) {
      // 判断是否执行关闭
      await this.hooks.shouldDismiss.call(context);
    }
    if (context.allowClose === false) {
      console.warn('shouldDismiss结果为false,关闭中断。');
      return false;
    }

    // 执行关闭前操作
    await this.hooks.beforeDismiss.call(data);

    // 执行实际关闭操作
    this._dismiss(data);
    this.destroy();
    return true;
  }

  /**
   * 执行完一次关闭后就会调销毁
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:22
   * @protected
   */
  protected destroy(): void {
    this.hooks.shouldDismiss.clear();
    this.hooks.beforeDismiss.clear();
  }
}
