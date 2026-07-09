import { SyncSeriesHook } from 'qx-util';
import { IDesignerProvider } from '../../interface';

/**
 * 设计界面组件注册
 *
 * @author zhanghanrui
 * @date 2024-05-24 16:05:18
 * @export
 * @class DesignerRegister
 */
export class DesignerRegister {
  /**
   * 已注册组件
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:36
   * @protected
   */
  protected map: Map<string, () => IDesignerProvider> = new Map();

  private providers: Map<string, IDesignerProvider> = new Map();

  readonly hooks = {
    register: new SyncSeriesHook<IDesignerProvider>(),
    unregister: new SyncSeriesHook<IDesignerProvider>(),
  };

  /**
   * 设计器项适配器注册
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:45
   * @param {string} tag 适配器标识
   * @param {() => IDesignerProvider} provider 设计器项
   */
  register(tag: string, provider: () => IDesignerProvider): void {
    this.map.set(tag, provider);
    const instance = provider();
    this.providers.set(tag, instance);
    this.hooks.register.callSync(null, instance);
  }

  /**
   * 设计器项适配器注销
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:55
   * @param {string} tag
   */
  unregister(tag: string): void {
    this.map.delete(tag);
    const instance = this.providers.get(tag);
    if (instance) {
      this.hooks.unregister.callSync(null, instance);
      this.providers.delete(tag);
    }
  }

  /**
   * 获取当前所有组件 keys
   *
   * @author zhanghanrui
   * @date 2024-05-24 17:05:56
   * @return {*}  {string[]}
   */
  getKeys(): string[] {
    return Array.from(this.map.keys());
  }

  /**
   * 获取现有所有适配器
   *
   * @author zhanghanrui
   * @date 2024-05-24 18:05:25
   * @return {*}  {IDesignerProvider[]}
   */
  getProviders(): IDesignerProvider[] {
    return Array.from(this.providers.values());
  }
}
