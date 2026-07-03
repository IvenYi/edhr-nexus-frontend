/**
 * 动态表格组件
 *
 * @interface IMobDynamicTableComponentExpose
 */
export interface IMobDynamicTableComponentExpose {
  /**
   * 重新加载数据
   *
   * @return {*}  {Promise<void>}
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
   * 校验表单内容
   * 
   * @return {*}  {Promise<boolean>}
   */
  validateInnerForms(): Promise<boolean>;
}
