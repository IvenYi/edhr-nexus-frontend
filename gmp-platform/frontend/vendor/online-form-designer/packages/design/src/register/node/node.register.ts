import { FIELD_TYPE } from '@gct/runtime';
import { DesignNodePrefix, DesignViewPrefix } from '../../constant';
import { INodeProvider } from '../../interface';

/**
 * 设计界面节点适配器注册
 *
 * @author zhanghanrui
 * @date 2024-07-06 11:07:57
 * @export
 * @class NodeRegister
 */
export class NodeRegister {
  /**
   * 适配器缓存
   *
   * @author zhanghanrui
   * @date 2024-07-06 11:07:15
   * @protected
   * @static
   */
  protected static map: Map<string, () => INodeProvider> = new Map();

  /**
   * 实例缓存
   *
   * @author zhanghanrui
   * @date 2024-07-06 12:07:33
   * @protected
   * @static
   * @type {Map<string, INodeProvider>}
   */
  protected static cache: Map<string, INodeProvider> = new Map();

  /**
   * 注册适配器
   *
   * @author zhanghanrui
   * @date 2024-07-09 09:07:17
   * @static
   * @param {string} name
   * @param {() => INodeProvider} provider
   * @param {string} [prefix]
   */
  static register(name: string, provider: () => INodeProvider, prefix?: string) {
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
   * @return {*}  {(INodeProvider | null)}
   */
  static get(name: string, prefix?: string): INodeProvider | null {
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
   * @param {() => INodeProvider} provider
   */
  static registerCustomHome(name: string, provider: () => INodeProvider) {
    this.register(name, provider, DesignViewPrefix.CUSTOM_HOME);
  }

  /**
   * 注册自定义导航页面插件
   *
   * @author zhanghanrui
   * @date 2024-08-19 17:08:06
   * @static
   * @param {string} name
   * @param {() => INodeProvider} provider
   */
  static registerCustomExpView(name: string, provider: () => INodeProvider) {
    this.register(name, provider, DesignViewPrefix.CUSTOM_EXP_VIEW);
  }

  /**
   * 注册自定义导航菜单页面插件
   *
   * @author zhanghanrui
   * @date 2024-08-24 10:08:51
   * @static
   * @param {string} name
   * @param {() => INodeProvider} provider
   */
  static registerCustomExpMenu(name: string, provider: () => INodeProvider) {
    this.register(name, provider, DesignViewPrefix.CUSTOM_EXP_MENU);
  }

  /**
   * 注册设计编辑器节点
   *
   * @author chitanda
   * @date 2025-07-07 16:07:58
   * @static
   * @param {FIELD_TYPE} fieldType
   * @param {() => INodeProvider} provider
   */
  static registerDesignEditorNode(fieldType: FIELD_TYPE, provider: () => INodeProvider) {
    this.register(fieldType, provider, DesignNodePrefix.DESIGN_EDITOR);
  }

  /**
   * 根据字段类型获取设计编辑器节点
   *
   * @author chitanda
   * @date 2025-07-07 16:07:06
   * @static
   * @param {FIELD_TYPE} fieldType
   * @returns {*}  {(INodeProvider | null)}
   */
  static getDesignEditorNode(fieldType: FIELD_TYPE): INodeProvider | null {
    return this.get(fieldType, DesignNodePrefix.DESIGN_EDITOR);
  }

  /**
   * 获取自定义首页插件
   *
   * @author zhanghanrui
   * @date 2024-07-09 09:07:58
   * @static
   * @param {string} name
   * @return {*}  {(INodeProvider | null)}
   */
  static getCustomHome(name: string): INodeProvider | null {
    return this.get(name, DesignViewPrefix.CUSTOM_HOME);
  }
}
