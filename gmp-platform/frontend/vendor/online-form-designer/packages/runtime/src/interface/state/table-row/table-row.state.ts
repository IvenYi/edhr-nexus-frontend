/**
 * 行数据状态
 *
 * @author zhanghanrui
 * @date 2024-04-16 21:04:21
 * @export
 * @interface ITableRowState
 */
export interface ITableRowState {
  /**
   * 是否已经删除
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-16 21:04:34
   * @type {boolean}
   */
  deleted: boolean;

  /**
   * 是否在悬浮态
   *
   * @author zhanghanrui
   * @date 2024-04-17 13:04:36
   * @type {boolean}
   */
  hover: boolean;

  /**
   * 是否在激活态
   *
   * @author zhanghanrui
   * @date 2024-04-17 13:04:45
   * @type {boolean}
   */
  active: boolean;
}
