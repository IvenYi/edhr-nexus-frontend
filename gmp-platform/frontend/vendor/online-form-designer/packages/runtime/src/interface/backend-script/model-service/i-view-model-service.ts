import { IPageQueryParams, IQueryParams } from '../i-query-params';

/**
 * 视图模型服务
 *
 * @interface IViewModelService
 * @template T
 */
export interface IViewModelService<T> {
  /**
   * 查询所有数据
   *
   * @returns {*}  {T[]} 指定的模型对象数组
   */
  listAll(): T[];
  /**
   * 分页查询
   *
   * @param {IPageQueryParams<T>} params 查询参数
   * @returns {*}  {T[]} 指定的模型对象数组
   */
  listByPage(params: IPageQueryParams<T>): T[];
  /**
   * 根据条件查询
   *
   * @param {IQueryParams<T>} params 查询参数
   * @returns {*}  {T}
   */
  getOne(params: IQueryParams<T>): T;
}
