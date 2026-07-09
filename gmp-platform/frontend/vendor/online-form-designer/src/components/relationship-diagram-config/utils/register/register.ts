import { ILinkProvider, INodeProvider } from '../../interface';

/**
 * 注册中心
 *
 * @author zhanghanrui
 * @date 2024-06-25 19:06:06
 * @export
 * @class RegisterUtil
 */
export class RegisterUtil {
  /**
   * 连线适配器
   *
   * @author zhanghanrui
   * @date 2024-06-25 19:06:55
   * @protected
   * @static
   * @type {Map<string, ILinkProvider>}
   */
  protected static link: Map<string, ILinkProvider> = new Map();

  /**
   * 节点适配器
   *
   * @author zhanghanrui
   * @date 2024-06-25 20:06:35
   * @protected
   * @static
   * @type {Map<string, INodeProvider>}
   */
  protected static node: Map<string, INodeProvider> = new Map();

  /**
   * 注册连线适配器
   *
   * @author zhanghanrui
   * @date 2024-06-25 19:06:11
   * @static
   * @param {string} key
   * @param {ILinkProvider} link
   */
  static registerLink(key: string, link: ILinkProvider) {
    RegisterUtil.link.set(key, link);
  }

  /**
   * 获取连线适配器
   *
   * @author zhanghanrui
   * @date 2024-06-25 19:06:17
   * @static
   * @param {string} key
   * @return {*}  {(ILinkProvider | undefined)}
   */
  static getLink(key: string): ILinkProvider | undefined {
    return RegisterUtil.link.get(key);
  }

  /**
   * 注册节点适配器
   *
   * @author zhanghanrui
   * @date 2024-06-25 20:06:02
   * @static
   * @param {string} key
   * @param {INodeProvider} node
   */
  static registerNode(key: string, node: INodeProvider) {
    RegisterUtil.node.set(key, node);
  }

  /**
   * 获取节点适配器
   *
   * @author zhanghanrui
   * @date 2024-06-25 20:06:09
   * @static
   * @param {string} key
   * @return {*}  {(INodeProvider | undefined)}
   */
  static getNode(key: string): INodeProvider | undefined {
    return RegisterUtil.node.get(key);
  }
}
