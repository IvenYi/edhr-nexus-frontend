/**
 * 连接数据
 *
 * @export
 * @interface ILinkData
 */
export interface ILinkData {
  /**
   * 连接标识
   *
   * @type {string}
   */
  id: string;
  /**
   * 连线类型
   *
   * @type {string}
   */
  type: string;
  /**
   * 连接类型
   *
   * @type {string}
   */
  joinType: string;
  /**
   * 连接源标识
   *
   * @type {string}
   */
  source: string;
  /**
   * 连接目标标识
   *
   * @type {string}
   */
  target: string;
  /**
   * 连接源过滤器
   *
   * @type {IObject}
   */
  sourceFilter: IObject;
  /**
   * 连接目标过滤器
   *
   * @type {IObject}
   */
  targetFilter: IObject;
  /**
   * 连接源字段
   *
   * @description 第二层为关联，arr[0]为 source 表字段，arr[1]为 target 表字段
   * @type {string[][]}
   */
  fields: string[][];
  /**
   * 连线配置是否有异常
   *
   * @type {boolean}
   */
  isError?: boolean;
  /**
   * 错误信息
   *
   * @type {string}
   */
  errMsg?: string;
}
