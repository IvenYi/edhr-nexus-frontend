/**
 * 连线方向
 *
 * @author zhanghanrui
 * @date 2024-06-30 13:06:37
 * @export
 * @enum {number}
 */
export enum ConnectionDirection {
  /**
   * 正向
   */
  FORWARD = 'forward',
  /**
   * 反向
   */
  REVERSE = 'reverse',
}

/**
 * 控制器标识
 *
 * @author zhanghanrui
 * @date 2024-06-25 09:06:57
 * @export
 * @enum {number}
 */
export enum ControllerTag {
  /**
   * 根节点控制器标识
   */
  ROOT = 'root-controller',
}

/**
 * 连线类型
 *
 * @author zhanghanrui
 * @date 2024-06-25 19:06:26
 * @export
 * @enum {number}
 */
export enum LinkType {
  /**
   * 默认连线
   */
  DEFAULT = 'default',

  /**
   * 虚拟连线
   */
  VIRTUAL = 'virtual',
}

/**
 * 节点类型
 *
 * @author zhanghanrui
 * @date 2024-06-25 20:06:44
 * @export
 * @enum {number}
 */
export enum NodeType {
  /**
   * 默认节点
   */
  DEFAULT = 'default',

  /**
   * 虚拟节点
   */
  VIRTUAL = 'virtual',

  /**
   * 反转节点
   */
  REVERSE = 'reverse',
}
