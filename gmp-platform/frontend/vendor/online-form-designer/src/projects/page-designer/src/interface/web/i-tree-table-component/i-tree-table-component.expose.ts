import { IDataTableQueryDataOptions } from "../i-data-table-component/i-data-table-component.expose";

/**
 * 树形表格
 *
 * @interface ITreeTableComponentExpose
 */
export interface ITreeTableComponentExpose{
   /**
   * 重新加载数据
   *
   * @param {IDataTableQueryDataOptions} [queryData]
   * @return {*}  {Promise<void>}
   */
  reload(queryData?: IDataTableQueryDataOptions): Promise<void>;

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
   * @param {IDataTableQueryDataOptions} [paginationData]
   */
  setParamsData(query?: IObject, paginationData?: IDataTableQueryDataOptions): void;

  /**
   * 添加数据
   *
   * @param {(IObject | IObject[])} data
   * @param {IObject} [dict]
   */
  addDataSource(data: IObject | IObject[], dict?: IObject): void;

    /**
   * 删除选中数据
   *
   * @return {*}  {Promise<void>}
   */
    deleteByChecked(): Promise<void>;

      /**
   * 根据索引效验
   *
   * @param {*} rowIndex
   * @return {*}  {Promise<void>}
   */
  validateByIndex(rowIndex: any): Promise<void>;

    /**
   * 表格值效验
   *
   * @return {*}  {Promise<void>}
   */
    fullValidate(): Promise<void>;
}
