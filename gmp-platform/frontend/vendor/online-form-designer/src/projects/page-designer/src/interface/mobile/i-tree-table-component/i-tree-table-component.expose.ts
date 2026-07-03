import { IMobDataTableQueryDataOptions } from "../i-data-table-component/i-data-table-component.expose";

/**
 * 树形表格
 *
 * @interface IMobTreeTableComponentExpose
 */
export interface IMobTreeTableComponentExpose{
   /**
   * 重新加载数据
   *
   * @param {IMobDataTableQueryDataOptions} [queryData]
   * @return {*}  {Promise<void>}
   */
  reload(queryData?: IMobDataTableQueryDataOptions): Promise<void>;

   /**
   * 获取选中值
   *
   * @return {*}  {(any | any[])}
   */
   getSelectedValue(): any | any[];

  /**
   * 设置查询条件
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
}
