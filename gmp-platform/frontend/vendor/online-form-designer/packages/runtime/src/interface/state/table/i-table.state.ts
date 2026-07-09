/**
 * 表格状态（驱动UI全放这里）
 *
 * @author zhanghanrui
 * @date 2024-04-16 10:04:31
 * @export
 * @interface ITableState
 */
export interface ITableState {
  /**
   * 当前表格所映射的表单key = ${name}___${data[model.key]}，用于表单验证实现
   *
   * @author zhanghanrui
   * @date 2024-04-18 13:04:27
   * @type {IData}
   */
  formData: IData;

  /**
   * 当前表格数据
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:18
   * @type {IData[]}
   */
  items: IData[];

  /**
   * 当前分页
   *
   * @author zhanghanrui
   * @date 2024-04-16 10:04:43
   * @type {number}
   */
  page: number;

  /**
   * 数据总条数
   *
   * @author zhanghanrui
   * @date 2024-04-16 10:04:53
   * @type {number}
   */
  total: number;

  /**
   * 分页大小
   *
   * @author zhanghanrui
   * @date 2024-04-16 10:04:19
   * @type {number}
   */
  size: number;
}
