/**
 * 执行按钮
 *
 * @interface IExcuteButtonComponentExpose
 */
export interface IExcuteButtonComponentExpose {
  /**
   * 自动执行
   *
   * @param {string} txnType 事务类型
   * @param {IObject} params 表单数据
   * @param {Function} callback 回调方法
   */
  autoExcute(txnType: string, params: IObject, callback: Function): void;

  /**
   * 设置事务数据
   * 
   * @param {IObject} value 表单数据
   */
  setParams(value: IObject): void;
}
