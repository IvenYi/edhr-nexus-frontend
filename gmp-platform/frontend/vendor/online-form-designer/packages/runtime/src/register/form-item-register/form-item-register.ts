import { IFormItemProvider } from '../../interface';

/**
 * 表单项适配器注册器
 *
 * @author zhanghanrui
 * @date 2024-04-01 13:04:12
 * @export
 * @class FormItemRegister
 */
export class FormItemRegister {
  /**
   * 编辑器集合
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:25
   * @private
   * @static
   * @type {Map<string, () => IFormItemProvider>}
   */
  private static items: Map<string, () => IFormItemProvider> = new Map();

  /**
   * 编辑器适配器注册
   *
   * @param {string} tag 适配器标识
   * @param {() => IFormItemProvider} provider 编辑器提供者
   */
  static register(tag: string, provider: () => IFormItemProvider): void {
    FormItemRegister.items.set(tag, provider);
  }

  /**
   * 编辑器适配器注销
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:29
   * @static
   * @param {string} tag
   */
  static unregister(tag: string): void {
    FormItemRegister.items.delete(tag);
  }

  /**
   * 获取编辑器适配器
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:16
   * @static
   * @param {string} tag
   * @return {*}  {(IFormItemProvider | null)}
   */
  static create(tag: string): IFormItemProvider | null {
    const provider = FormItemRegister.items.get(tag);
    if (provider) {
      const instance = provider();
      return instance;
    }
    return null;
  }
}
