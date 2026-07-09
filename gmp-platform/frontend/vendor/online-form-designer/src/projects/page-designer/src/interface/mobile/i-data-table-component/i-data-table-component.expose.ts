/**
 * 表格查询
 *
 * @interface IDataTableQueryDataOptions
 */
export interface IMobDataTableQueryDataOptions {
  query: Record<string, any>;
  exp?: string;
  pageNo: number;
  pageSize: number;
  sorts: { sortfield: string; sortType: 'asc' | 'desc' }[];
  parent_id_?: string;
  foreignFields: string[];
}

/**
 * 移动端表格组件
 *
 * @interface IMobDataTableComponentExpose
 */
export interface IMobDataTableComponentExpose {
  /**
   * 重新加载数据
   *
   */
  reload(): void;
  /**
   * 设置查询参数
   *
   * @param {IObject} [query]
   * @param {IMobDataTableQueryDataOptions} [paginationData]
   */
  setParamsData(query?: IObject, paginationData?: IMobDataTableQueryDataOptions): void;
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
   * 获取选中值
   *
   * @return {*}  {(any | any[])}
   */
  getSelectedValue(): any | any[];
  /**
   * 获取查询条件
   *
   * @return {*}  {IMobDataTableQueryDataOptions}
   */
  getParameters(): IMobDataTableQueryDataOptions;
}
