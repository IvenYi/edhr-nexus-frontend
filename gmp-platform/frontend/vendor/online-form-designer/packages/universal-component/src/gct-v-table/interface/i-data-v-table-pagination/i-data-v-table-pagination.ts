/**
 * 数据表格分页信息
 *
 * @export
 * @interface IDataVTablePagination
 */
export interface IDataVTablePagination {
  /**
   * 当前页码
   *
   * @type {number}
   */
  pageNo: number;
  /**
   * 每页条数
   *
   * @type {number}
   */
  pageSize: number;
  /**
   * 总条数
   *
   * @type {number}
   */
  total: number;
}
