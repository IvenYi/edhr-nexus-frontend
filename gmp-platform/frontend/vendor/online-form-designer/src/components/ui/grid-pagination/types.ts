/**
 * 表格分页数据
 *
 * @export
 * @interface GridPaginationValue
 */
export interface GridPaginationValue {
  /**
   * total number of data items
   * @default 0
   * @type number
   */
  total?: number;

  /**
   * current page number
   * @type number
   */
  current?: number;

  /**
   * number of data items per page
   * @type number
   */
  pageSize?: number;
}
