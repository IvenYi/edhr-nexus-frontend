import { IPageQueryParams, ISearchQueryParams } from '../i-query-params';

/**
 * rdo 模型服务
 *
 * @interface IRdoModelService
 * @template T 模型类型
 */
export interface IRdoModelService<T> {
  /**
   *
   *
   * @param {{ id:string }} params
   * @returns {*}  {string}
   */
  rdoRemoveVersionById(params: { id: string }): string;
  /**
   *
   *
   * @param {{ refId:string }} prams
   * @returns {*}  {T}
   */
  rdoGetVersionByRefId(prams: { refId: string }): T;
  /**
   *
   *
   * @param {T} data
   * @returns {*}  {string}
   */
  rdoSaveVersion(data: T): string;
  /**
   *
   *
   * @param {T[]} data
   * @returns {*}  {string[]}
   */
  rdoSaveBatch(data: T[]): string[];
  /**
   *
   *
   * @param {{ id:string }} params
   * @returns {*}  {T[]}
   */
  rdoListVersionById(params: { id: string }): T[];
  /**
   *
   *
   * @param {{ id: string }} params
   * @returns {*}  {string}
   */
  rdoRemoveById(params: { id: string }): string;
  /**
   *
   *
   * @param {IPageQueryParams<T>} params
   * @returns {*}  {T[]}
   */
  rdoListByPage(params: IPageQueryParams<T>): T[];
  /**
   *
   *
   * @param {ISearchQueryParams<T>} params
   * @returns {*}  {T[]}
   */
  rdoListAllVersion(params: ISearchQueryParams<T>): T[];
  /**
   *
   *
   * @param {{id:string}} params
   * @returns {*}  {string}
   */
  rdoUpdateVersionById(params: { id: string }): string;
  /**
   *
   *
   * @param {ISearchQueryParams<T>} params
   * @returns {*}  {T[]}
   */
  rdoListAll(params: ISearchQueryParams<T>): T[];
  /**
   *
   *
   * @param {T} data
   * @returns {*}  {string}
   */
  rdoSave(data: T): string;
  /**
   *
   *
   * @param {IPageQueryParams<T>} params
   * @returns {*}  {T[]}
   */
  rdoRefListByPage(params: IPageQueryParams<T>): T[];
}
