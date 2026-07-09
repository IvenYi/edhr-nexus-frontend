import { IPageQueryParams, IQueryParams, ISearchQueryParams } from '../i-query-params';

/**
 * 模型服务接口
 *
 * @interface IModelService
 * @template T 具体的模型对象
 */
export interface IModelService<T> {
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
   * 根据主键查询
   *
   * @param {{ ids:string[] }} params 查询参数
   * @returns {*}  {T[]} 指定的模型对象数组
   */
  listByIds(params: { ids: string[] }): T[];
  /**
   * 根据条件查询
   *
   * @param {IQueryParams<T>} params 查询参数
   * @returns {*}  {T}
   */
  getOne(params: IQueryParams<T>): T;
  /**
   * 根据主键查询
   *
   * @param {{ id: string }} params 查询参数
   * @returns {*}  {T}
   */
  getById(params: { id: string }): T;
  /**
   * 保存
   *
   * @param {T} data
   * @returns {*}  {string}
   */
  save(data: T): string;
  /**
   * 批量保存
   *
   * @param {T[]} items
   * @returns {*}  {string[]}
   */
  saveBatch(items: T[]): string[];
  /**
   * 保存或者更新，根据主键判断
   *
   * @param {T} data
   * @returns {*}  {string}
   */
  saveOrUpdate(data: T): string;
  /**
   * 更新数据
   *
   * @param {T} data
   * @param {IQueryParams<T>} [params]
   * @returns {*}  {string}
   */
  update(data: T, params?: IQueryParams<T>): string;
  /**
   *
   *
   * @param {T} data
   * @param {{ id: string }} params
   * @returns {*}  {string}
   */
  updateById(data: T, params: { id: string }): string;
  /**
   *
   *
   * @param {T} data
   * @param {{ ids: string[] }} params
   * @returns {*}  {string[]}
   */
  updateByIds(data: T, params: { ids: string[] }): string[];
  /**
   * 批量更新
   *
   * @param {T[]} data
   */
  updateBatch(data: T[]): void;
  /**
   * 删除数据
   *
   * @param {T} data
   * @param {IQueryParams<T>} [params]
   */
  remove(data: T, params?: IQueryParams<T>): void;
  /**
   * 根据 id 删除数据
   *
   * @param {{ id:string }} params
   * @returns {*}  {string}
   */
  removeById(params: { id: string }): string;
  /**
   * 根据 id 批量删除数据
   *
   * @param {{ ids : string[] }} params
   * @returns {*}  {string[]}
   */
  removeByIds(params: { ids: string[] }): string[];
  /**
   * 提交数据
   *
   * @param {T} data
   * @returns {*}  {string}
   */
  submit(data: T): string;
  /**
   *
   *
   * @param {ISearchQueryParams<T>} [params]
   * @returns {*}  {T}
   */
  getTopOne(params?: ISearchQueryParams<T>): T;
  /**
   * 获取总数量
   *
   * @param {IQueryParams<T>} [params]
   * @returns {*}  {number}
   */
  count(params?: IQueryParams<T>): number;
  /**
   *
   *
   * @param {T} data
   * @returns {*}  {string}
   */
  savePreferExternalId(data: T): string;
  /**
   *
   *
   * @param {T[]} data
   * @returns {*}  {string[]}
   */
  saveBatchPreferExternalId(data: T[]): string[];
}
