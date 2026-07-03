/**
 * 搜索组件
 *
 * @interface IPadSearchComponentExpose
 */
export interface IPadSearchComponentExpose {
  /**
   * 设置搜索的值
   *
   */
  setValueBySearch(value: IObject): void;

  /**
   * 搜索方法
   *
   * @return {*}  {Promise<void>}
   */
  search(): Promise<void>;

  /**
   * 获取查询条件
   *
   * @return {*} {IObject}
   */
  getBodyBySearch(): IObject;
}
