import { IDesignNodeData } from './i-design-node-data';

/**
 * 设计节点
 *
 * @author zhanghanrui
 * @date 2024-07-09 16:07:21
 * @export
 * @interface IDesignNode
 * @template T
 */
export interface IDesignNode<T extends IDesignNodeData = IDesignNodeData> {
  /**
   * 节点唯一标识
   *
   * @author zhanghanrui
   * @date 2024-07-05 13:07:46
   * @type {string}
   */
  id: string;

  /**
   * 排序值
   * 2024年8月23日15:10:19 - 改版后 order 不再使用
   *
   * @deprecated
   * @author zhanghanrui
   * @date 2024-07-12 14:07:40
   * @type {number}
   */
  order?: number;

  /**
   * 名称
   *
   * @author zhanghanrui
   * @date 2024-07-05 15:07:37
   * @type {string}
   */
  label: string;

  /**
   * 节点类型
   *
   * @author zhanghanrui
   * @date 2024-07-05 13:07:46
   * @type {string}
   */
  type: string;

  /**
   * 数据更新时间戳
   *
   * @author zhanghanrui
   * @date 2024-07-05 17:07:02
   * @type {number}
   */
  updateDate: number;

  /**
   * 设计项的数据
   *
   * @author zhanghanrui
   * @date 2024-07-09 16:07:47
   * @type {T}
   */
  data: T;

  /**
   * 父节点标识
   * 2024年8月23日15:10:19 - 改版后 parentId 不再使用
   *
   * @deprecated
   * @author zhanghanrui
   * @date 2024-07-05 13:07:38
   * @type {string}
   */
  parentId?: string;

  /**
   * 克隆
   *
   * @author zhanghanrui
   * @date 2024-07-12 13:07:44
   * @return {*}  {IDesignNode}
   */
  clone(): IDesignNode;
}
