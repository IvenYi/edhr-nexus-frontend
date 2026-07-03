import { DesignRenderViewPrefix } from '../../constant';
import { IRenderBaseNodeProvider, IRenderEditorNodeProvider } from '../../interface';

/**
 * 设计界面节点适配器注册
 *
 * @author zhanghanrui
 * @date 2024-07-06 11:07:57
 * @export
 * @class RenderNodeRegister
 */
export class RenderNodeRegister {
  /**
   * 适配器缓存
   *
   * @author zhanghanrui
   * @date 2024-07-06 11:07:15
   * @protected
   * @static
   */
  protected static map: Map<string, () => IRenderBaseNodeProvider> = new Map();

  /**
   * 实例缓存
   *
   * @author zhanghanrui
   * @date 2024-07-06 12:07:33
   * @protected
   * @static
   * @type {Map<string, IRenderBaseNodeProvider>}
   */
  protected static cache: Map<string, IRenderBaseNodeProvider> = new Map();

  /**
   * 注册适配器
   *
   * @author zhanghanrui
   * @date 2024-07-09 09:07:17
   * @static
   * @param {string} name
   * @param {() => IRenderBaseNodeProvider} provider
   * @param {string} [prefix]
   */
  static register(name: string, provider: () => IRenderBaseNodeProvider, prefix?: string) {
    const tag = prefix ? `${prefix}:${name}` : name;
    this.map.set(tag, provider);
  }

  /**
   * 获取适配器
   *
   * @author zhanghanrui
   * @date 2024-07-09 09:07:49
   * @static
   * @param {string} name
   * @param {string} [prefix]
   * @return {*}  {(IRenderBaseNodeProvider | null)}
   */
  static get(name: string, prefix?: string): IRenderBaseNodeProvider | null {
    const tag = prefix ? `${prefix}:${name}` : name;
    if (this.cache.has(tag)) {
      return this.cache.get(tag)!;
    }
    const provider = this.map.get(tag);
    if (provider) {
      const ins = provider();
      this.cache.set(tag, ins);
      return ins;
    }
    return null;
  }

  /**
   * 注册自定义首页插件
   *
   * @author zhanghanrui
   * @date 2024-07-09 09:07:44
   * @static
   * @param {string} name
   * @param {() => IRenderBaseNodeProvider} provider
   */
  static registerCustomHome(name: string, provider: () => IRenderBaseNodeProvider) {
    this.register(name, provider, DesignRenderViewPrefix.CUSTOM_HOME);
  }

  /**
   * 注册设计编辑器节点
   *
   * @author chitanda
   * @date 2025-07-08 13:07:42
   * @static
   * @param {string} name
   * @param {() => IRenderEditorNodeProvider} provider
   */
  static registerDesignEditorNode(name: string, provider: () => IRenderEditorNodeProvider) {
    this.register(name, provider, DesignRenderViewPrefix.DESIGN_EDITOR);
  }

  /**
   * 获取自定义首页插件
   *
   * @author zhanghanrui
   * @date 2024-07-09 09:07:58
   * @static
   * @param {string} name
   * @return {*}  {(IRenderBaseNodeProvider | null)}
   */
  static getCustomHome(name: string): IRenderBaseNodeProvider | null {
    return this.get(name, DesignRenderViewPrefix.CUSTOM_HOME);
  }

  /**
   * 获取设计编辑器节点
   *
   * @author chitanda
   * @date 2025-07-08 14:07:02
   * @static
   * @param {string} name
   * @returns {*}  {(IRenderEditorNodeProvider | null)}
   */
  static getDesignEditorNode(name: string): IRenderEditorNodeProvider | null {
    return this.get(name, DesignRenderViewPrefix.DESIGN_EDITOR) as IRenderEditorNodeProvider | null;
  }
}
