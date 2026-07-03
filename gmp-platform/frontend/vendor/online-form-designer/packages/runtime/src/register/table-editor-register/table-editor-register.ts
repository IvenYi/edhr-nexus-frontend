import { ITableEditorProvider } from '../../interface';

/**
 * 编辑器实现注册器
 *
 * @author zhanghanrui
 * @date 2024-03-27 10:03:59
 * @export
 * @class TableEditorRegister
 */
export class TableEditorRegister {
  /**
   * 编辑器集合
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:25
   * @private
   * @static
   * @type {Map<string, () => ITableEditorProvider>}
   */
  private static editors: Map<string, () => ITableEditorProvider> = new Map();

  /**
   * 已经实例化的编辑器集合
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:43
   * @private
   * @static
   * @type {Map<string, ITableEditorProvider>}
   */
  private static providers: Map<string, ITableEditorProvider> = new Map();

  /**
   * 编辑器适配器注册
   *
   * @param {string} tag 适配器标识
   * @param {() => ITableEditorProvider} provider 编辑器提供者
   */
  static register(tag: string, provider: () => ITableEditorProvider): void {
    TableEditorRegister.editors.set(tag, provider);
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
    TableEditorRegister.editors.delete(tag);
  }

  /**
   * 获取编辑器适配器
   *
   * @author zhanghanrui
   * @date 2024-04-17 11:04:33
   * @static
   * @param {string} tag
   * @return {*}  {(ITableEditorProvider | null)}
   */
  static get(tag: string): ITableEditorProvider | null {
    if (this.providers.has(tag)) {
      return this.providers.get(tag)!;
    }
    const provider = TableEditorRegister.editors.get(tag);
    if (provider) {
      const instance = provider();
      this.providers.set(tag, instance);
      return instance;
    }
    return null;
  }
}
