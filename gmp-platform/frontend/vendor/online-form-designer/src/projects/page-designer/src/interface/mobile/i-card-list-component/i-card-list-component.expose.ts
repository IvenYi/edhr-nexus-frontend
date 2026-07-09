/**
 * 卡片列表查询
 *
 * @interface IMobCardListQueryDataOptions
 */
export interface IMobCardListQueryDataOptions {
  query: Record<string, any>;
  exp?: string;
  pageNo: number;
  pageSize: number;
  sorts: { sortfield: string; sortType: 'asc' | 'desc' }[];
  parent_id_?: string;
  foreignFields: string[];
  searchModelKey?: string;
}

/**
 * 卡片列表组件
 *
 * @interface ICardListQueryDataOptions
 */
export interface ICardListQueryDataOptions {
  /**
   * 重新加载数据
   *
   * @param {IMobCardListQueryDataOptions} [queryData]
   * @return {*}  {void}
   */
  reload(queryData?: IMobCardListQueryDataOptions): void;
  /**
   * 获取选中值
   *
   * @return {*}  {(any | any[])}
   */
  getSelectedDataSource(): any | any[];
  /**
   * 设置选中值
   *
   * @param {string} rowKey 主键字段标识
   * @param {string[]} keys 设置选中值
   * @return {*}  {Promise<void>}
   */

  addDataSource(data: IObject | IObject[], dict?: IObject): void;
  /**
   * 设置数据
   *
   * @param {(IObject | IObject[])} data
   * @param {IObject} [dict]
   */
  setDataSource(data: IObject | IObject[], dict?: IObject): void;
  /**
   * 获取数据
   *
   * @return {*}  {IObject[]}
   */
  getDataSource(): IObject[];
  /**
   * 表格值效验
   *
   * @return {*}  {Promise<void>}
   */
  validate(): Promise<void>;
  
}
