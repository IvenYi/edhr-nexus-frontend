/**
 * 节点项
 *
 * @export
 * @interface INodeData
 */
export interface INodeData {
  [key: string | symbol] : any;
  /**
   * 节点标识(同 ModelKey)，一个模型只能有一个节点
   *
   * @type {string}
   */
  id: string;
  /**
   * 节点类型
   *
   * @type {string}
   */
  type: string;
  /**
   * 模型标识
   *
   * @type {string}
   */
  modelKey: string;
  /**
   * 模型名称
   *
   * @type {string}
   */
  modelName: string;
  /**
   * 模型大类
   *
   * @type {string}
   */
  modelCategory: string;
  /**
   * 节点模型勾选的属性
   *
   * @type {string[]}
   */
  fields: string[];
}
