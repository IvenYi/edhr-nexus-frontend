import { IDataTableQueryDataOptions } from '../i-data-table-component/i-data-table-component.expose';

/**
 * rdo表格
 *
 * @interface IRdoTableComponentExpose
 */
export interface IRdoTableComponentExpose {
  /**
   * 添加数据
   *
   * @param {(IObject | IObject[])} data
   * @param {IObject} [dict]
   */
  addDataSource(data: IObject | IObject[], dict?: IObject): void;

  /**
   * 重新加载数据
   *
   * @param {IDataTableQueryDataOptions} [queryData]
   * @return {*}  {Promise<void>}
   */
  reload(queryData?: IDataTableQueryDataOptions): Promise<void>;
}
