/**
 * 子表组件
 *
 * @interface IMobSubTableComponentExpose
 */
export interface IMobSubTableComponentExpose {
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
}
