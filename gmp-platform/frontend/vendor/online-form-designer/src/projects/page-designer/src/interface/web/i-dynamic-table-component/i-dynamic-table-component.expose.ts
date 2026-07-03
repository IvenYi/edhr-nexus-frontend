/**
 * 动态表格组件
 *
 * @interface IDynamicTableComponentExpose
 */
export interface IDynamicTableComponentExpose {
  /**
   * 重新加载数据
   *
   * @return {*}  {Promise<void>}
   */
  reload(): Promise<void>;
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
}
