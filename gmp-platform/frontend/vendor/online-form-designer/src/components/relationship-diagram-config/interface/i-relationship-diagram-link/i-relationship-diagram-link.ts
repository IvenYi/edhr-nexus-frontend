/**
 * 连线
 *
 * @author zhanghanrui
 * @date 2024-06-25 10:06:46
 * @export
 * @interface IRelationshipDiagramLink
 */
export interface IRelationshipDiagramLink {
  /**
   * 连线唯一标识
   *
   * @author zhanghanrui
   * @date 2024-06-25 13:06:08
   * @type {string}
   */
  id: string;

  /**
   * 第几条连线
   *
   * @author zhanghanrui
   * @date 2024-06-27 13:06:00
   * @type {number}
   */
  i: number;

  /**
   * 连线类型
   *
   * @author zhanghanrui
   * @date 2024-06-25 13:06:52
   * @type {string}
   */
  type: string;

  /**
   * 起始节点标识
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:31
   * @type {string}
   */
  source: string;

  /**
   * 目标节点标识
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:38
   * @type {string}
   */
  target: string;

  /**
   * 是否为反向连线
   *
   * @author zhanghanrui
   * @date 2024-06-25 16:06:07
   * @type {boolean}
   */
  reverse?: boolean;

  /**
   * 是否为换行连线
   *
   * @author zhanghanrui
   * @date 2024-06-25 16:06:07
   * @type {boolean}
   */
  return?: boolean;

  /**
   * 从第几行开始画线
   *
   * @author zhanghanrui
   * @date 2024-06-25 16:06:04
   * @type {number}
   */
  startLine: number;
}
