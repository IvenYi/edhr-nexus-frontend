/**
 * 素材项
 *
 * @author zhanghanrui
 * @date 2024-07-09 11:07:07
 * @export
 * @interface IMaterialData
 */
export interface IMaterialData {
  /**
   * 分组
   *
   * @author zhanghanrui
   * @date 2024-07-09 11:07:16
   * @type {string}
   */
  group: string;

  /**
   * 节点类型
   *
   * @author zhanghanrui
   * @date 2024-07-09 11:07:28
   * @type {string}
   */
  type: string;

  /**
   * 节点名称
   *
   * @author zhanghanrui
   * @date 2024-07-09 11:07:34
   * @type {string}
   */
  label: string;

  /**
   * 节点图标
   *
   * @author zhanghanrui
   * @date 2024-07-09 11:07:40
   * @type {string}
   */
  icon?: string;

  /**
   * 素材项顺序
   *
   * @author zhanghanrui
   * @date 2024-07-09 13:07:55
   * @type {number}
   */
  order: number;
}
