/**
 * 组件参数配置
 *
 * @author zhanghanrui
 * @date 2024-06-28 14:06:53
 * @export
 * @interface IRelationshipDiagramOptions
 */
export interface IRelationshipDiagramOptions {
  /**
   * 一行显示多少个节点，默认一行显示三个
   *
   * @default 3
   * @author zhanghanrui
   * @date 2024-06-28 14:06:00
   * @type {number}
   */
  lineCount: number;
  /**
   * 从第几个节点开始可以反转，默认不限制
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:06
   * @type {number}
   */
  reverseCount?: number;
  /**
   * 最多可以建立多少个节点，默认不限制
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:13
   * @type {number}
   */
  max?: number;
  /**
   * 是否为单方向绘制，默认不限制
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:10
   * @type {boolean}
   */
  oneDirection?: boolean;
  /**
   * 可以有几个反转节点，默认不限制
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:02
   * @type {number}
   */
  reverseMax?: number;
}
