/**
 * 子表组件
 *
 * @interface ISubTableComponentExpose
 */
export interface ISubTableComponentExpose {
  /**
   * 重新加载数据
   *
   */
  reload(): void;
  /**
   * 添加数据
   *
   * @param {(IObject | IObject[])} data
   * @param {IObject} [dict]
   */
  addValue(data: IObject | IObject[], dict?: IObject): void;
  /**
   * 设置数据
   *
   * @param {(IObject | IObject[])} data
   * @param {IObject} [dict]
   */
  setValue(data: IObject | IObject[], dict?: IObject): void;
  /**
   * 获取数据
   *
   * @return {*}  {IObject[]}
   */
  getValue(): IObject[];
  /**
   * 表格值校验
   *
   * @return {*}  {Promise<string | void>}
   */
  tableFormValidate(): Promise<string | void>;
  /**
   * 根据索引校验
   *
   * @param {*} rowIndex
   * @return {*}  {Promise<void>}
   */
  validateByIndex(rowIndex: any): Promise<void>;
  /**
   * 校验
   *
   * @return {*}  {Promise<void>}
   */
  validate(): Promise<void>;
  /**
   * 清空校验
   *
   * @return {*}  {Promise<void>}
   */
  clearValidate(): Promise<void>;

  /**
   * 恢复删除的数据
   * @param {*} id
   *
   */
  revertDeletedData(id: any): void;

  /**
   * 设置前端显示表格数据
   *
   * @param {IObject[]} data
   * @param {IObject} [dict]
   */
  setFrontTableData(data: IObject[], dict?: IObject): void;
  /**
   * 设置表格所有行展开状态
   *
   * @param {boolean} expand
   */
  setTableAllTreeExpand(expand: boolean): void;
    /**
   * 强制加载
   */
  forceReload(id?:string):void;
}
