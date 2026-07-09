/**
 * 表格查询参数
 *
 * @interface IDataTableQueryDataOptions
 */
export interface IDataTableQueryDataOptions {
  query?: Record<string, any>;
  exp?: string;
  pageNo?: number;
  pageSize?: number;
  sorts?: { sortfield: string; sortType: 'asc' | 'desc' }[];
  foreignFields?: string[];
}

/**
 * 表格组件
 *
 * @interface IDataTableComponentExpose
 */
export interface IDataTableComponentExpose {
  /**
   * 重新加载数据
   *
   * @param {IDataTableQueryDataOptions} [queryData]
   * @return {*}  {Promise<void>}
   */
  reload(queryData?: IDataTableQueryDataOptions): Promise<void>;
  /**
   *  实时获取表格当前页面的选中项
   */
  getCurrentSelectedValue(): any | any[];
  /**
   * 获取选中值
   *
   * @return {*}  {(any | any[])}
   */
  getSelectedValue(): any | any[];
  /**
   * 设置选中值
   *
   * @param {string} rowKey 主键字段标识
   * @param {string[]} keys 设置选中值
   * @return {*}  {Promise<void>}
   */
  setSeleckedByKeys(rowKey: string, keys: string[]): Promise<void>;
  /**
   * 添加数据
   *
   * @param {(IObject | IObject[])} data
   * @param {IObject} [dict]
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
  fullValidate(): Promise<void>;
  /**
   * 根据索引效验
   *
   * @param {*} rowIndex
   * @return {*}  {Promise<void>}
   */
  validateByIndex(rowIndex: any): Promise<void>;
  /**
   * 设置查询条件
   *
   * @param {IObject} [query]
   * @param {IDataTableQueryDataOptions} [paginationData]
   */
  setParamsData(query?: IObject, paginationData?: IDataTableQueryDataOptions): void;
  /**
   * 获取查询条件
   *
   * @return {*}  {IDataTableQueryDataOptions}
   */
  getParameters(): IDataTableQueryDataOptions;
  /**
   * 删除选中数据
   *
   * @return {*}  {Promise<void>}
   */
  deleteByChecked(): Promise<void>;
}
