/**
 * 描述列表组件
 *
 * @interface IMobDescriptionsComponentExpose
 */
export interface IMobDescriptionsComponentExpose {
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
   * @return {*}  {IObject}
   */
  getValue(): IObject;
  /**
   * 删除当前表单数据
   *
   * @return {*}  {Promise<void>}
   */
  deleteData(): Promise<void>;
}
