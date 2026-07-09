/**
 * 查询排序项
 *
 * @interface ISortItem
 */
export interface ISortItem {
  /**
   * 排序属性
   *
   * @type {string}
   */
  sortField: string;
  /**
   * 排序方式
   *
   * @type {('asc' | 'desc')}
   */
  sortType: 'asc' | 'desc';
}
