/**
 * 选择搜索组件
 *
 * @interface ISelectSearchComponentExpose
 */
export interface ISelectSearchComponentExpose {
  /**
   * 选中行
   * 
   * @param {IObject} record
   */
  selectRow(record: IObject): void;

  /**
   * 重新加载数据
   *
   */
  reload(): void;
}
