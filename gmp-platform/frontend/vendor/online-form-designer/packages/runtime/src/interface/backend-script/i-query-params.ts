import { ISortItem } from './i-sort-item';

/**
 * 查询参数
 *
 * @category root
 * @interface IQueryParams
 * @template T 查询对象模型
 */
export interface IQueryParams<T> {
  /**
   * 查询条件
   *
   * @type {T}
   */
  query?: T;
  /**
   *
   *
   * @type {string}
   */
  exp?: string;
}

/**
 * 搜索查询参数
 *
 * @category root
 * @interface ISearchQueryParams
 * @extends {IQueryParams<T>}
 * @template T
 */
export interface ISearchQueryParams<T> extends IQueryParams<T> {
  /**
   * 排序条件
   *
   * @type {ISortItem[]}
   */
  sorts?: ISortItem[];
}

/**
 * 分页查询参数
 *
 * @category root
 * @interface IPageQueryParams
 * @extends {IQueryParams<T>}
 * @template T
 */
export interface IPageQueryParams<T> extends IQueryParams<T> {
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
}
