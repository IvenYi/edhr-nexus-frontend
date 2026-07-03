/**
 * 表格数据查询结构
 *
 * @export
 * @interface IDataVTableQuery
 */
export interface IDataVTableQuery {
  /**
   * 当前分页
   *
   * @type {number}
   */
  pageNo: number;
  /**
   * 每页大小
   *
   * @type {number}
   */
  pageSize: number;
  /**
   * 查询过滤参数
   *
   * @type {IObject}
   */
  query?: IObject;
  /**
   * 查询表达式
   *
   * @type {string}
   */
  exp?: string;
  /**
   *
   *
   * @type {string[]}
   */
  foreignFields?: string[];
  /**
   * 排序字段
   *
   * @type {(Array<{
   *     sortField: string;
   *     sortType: 'asc' | 'desc';
   *   }>)}
   */
  sorts?: Array<{
    sortField: string;
    sortType: 'asc' | 'desc';
  }>;
}
