/**
 * 事务执行按钮组件
 * 
 * @interface IExecuteButtonComponentExpose
 */

export interface IExecuteButtonComponentExpose {
  /**
   * 设置按钮执行参数
   * 建议使用执行前事件形成需要的数据结构
   * @param {object} value
   */
  setParams(value: object): void;
}