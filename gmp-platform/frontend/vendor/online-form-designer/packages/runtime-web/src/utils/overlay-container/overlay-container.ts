/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QXEvent } from 'qx-util';
import { App, Component, h, VNode, nextTick } from 'vue';

type IOverlayContainer = {
  present(): Promise<void>;
  dismiss(data?: unknown): Promise<void>;
  onWillDismiss<T = unknown>(): Promise<T>;
};

/**
 * 全局弹出承载组件
 *
 * @author zhanghanrui
 * @date 2024-03-19 19:03:22
 * @export
 * @class OverlayContainer
 * @implements {IOverlayContainer}
 * @template O
 */
export class OverlayContainer<O> implements IOverlayContainer {
  protected vm?: App;

  /**
   * 具体模态组件对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:45
   * @protected
   * @type {*}
   */
  protected modal: any;

  /**
   * 调用dismiss时传的result结果
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:30
   * @protected
   * @type {unknown}
   */
  protected result?: unknown;

  /**
   * 内部事件
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:44
   * @protected
   */
  protected evt: QXEvent<{ dismiss: (data?: unknown) => void }> = new QXEvent();

  /**
   * 创建全局呈现
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:51
   * @param {unknown} component
   * @param {(...args: any[]) => VNode} render
   * @param {O} [opts]
   */
  constructor(
    protected component: unknown,
    protected render: (...args: any[]) => VNode,
    protected opts?: O,
  ) {
    this.init();
  }

  static createVueApp(_rootComponent: Component, _rootProps?: IData): App<Element> {
    throw new Error('没有注入createVueApp方法');
  }

  /**
   * 初始化飘窗
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:00
   * @protected
   * @return {*}  {void}
   */
  protected init(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const { render, opts } = this;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const vm = OverlayContainer.createVueApp({
      mounted() {
        self.modal = this.$refs.root;
      },
      unmounted() {
        document.body.removeChild(container);
        self.evt.emit('dismiss', self.result);
      },
      render() {
        return h(
          self.component as string,
          {
            ref: 'root',
            opts,
            onDismiss(data: IData) {
              self.result = data;
              vm.unmount();
            },
          },
          { default: render },
        );
      },
    });
    vm.mount(container);
    this.vm = vm;
  }

  /**
   * 打开飘窗
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:14
   * @return {*}  {Promise<void>}
   */
  async present(): Promise<void> {
    await nextTick();
    return this.modal.present();
  }

  /**
   * 手动调用关闭飘窗
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:19
   * @param {unknown} [data]
   * @return {*}  {Promise<void>}
   */
  async dismiss(data?: unknown): Promise<void> {
    await this.modal.dismiss(data);
  }

  /**
   * 订阅窗口关闭
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:26
   * @template T
   * @return {*}  {Promise<T>}
   */
  async onWillDismiss<T = unknown>(): Promise<T> {
    return new Promise<T>((resolve) => {
      const callback = (data: unknown) => {
        resolve(data as T);
        this.evt.off('dismiss', callback);
      };
      this.evt.on('dismiss', callback);
    });
  }
}
