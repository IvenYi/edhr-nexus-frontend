/**
 * 节点
 *
 * @author zhanghanrui
 * @date 2024-06-25 10:06:53
 * @export
 * @interface IRelationshipDiagramNode
 */
export interface IRelationshipDiagramNode {
  /**
   * 节点唯一标识
   *
   * @author zhanghanrui
   * @date 2024-06-25 13:06:35
   * @type {string}
   */
  id: string;

  /**
   * 字段唯一标识
   *
   * @author zhanghanrui
   * @date 2024-07-05 10:07:11
   * @type {string | null}
   */
  id_: string | null;

  /**
   * 节点类型
   *
   * @author zhanghanrui
   * @date 2024-06-25 13:06:44
   * @type {string}
   */
  type: string;

  /**
   * 当前模型标识
   *
   * @author zhanghanrui
   * @date 2024-06-26 16:06:15
   * @type {string | null}
   */
  modelKey: string | null;

  /**
   * 模型类型
   *
   * @author zhanghanrui
   * @date 2024-06-26 16:06:30
   * @type {string | null}
   */
  modelCategory: string | null;

  /**
   * 属性key
   *
   * @author zhanghanrui
   * @date 2024-06-26 16:06:46
   * @type {string | null}
   */
  value: string | null;

  /**
   * 属性文本
   *
   * @author zhanghanrui
   * @date 2024-06-26 16:06:56
   * @type {string | null}
   */
  label: string | null;

  /**
   * 是否为反向节点
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:46
   * @type {boolean}
   */
  reverse?: boolean;

  /**
   * 禁止选择属性
   *
   * @author zhanghanrui
   * @date 2024-06-28 13:06:52
   * @type {boolean}
   */
  noSelectField?: boolean;
}
