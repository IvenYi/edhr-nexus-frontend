/**
 * 包装》条码
 * @interface IPackageBarcodeComponent
 */

export interface IPackageBarcodeComponent {
  /**
   * 获取选中当前条码整体信息
   * @return {string}
   */
  getValue(): object;

  /**
   * 设置选中条码信息
   * @param {string} value
   */
  setValue(value: string): void;

  /**
   * 执行查询动作
   */
  search(): void;

  /**
   * 异步函数重置组件为初始态
   * @return {Promise<void>}
   */
  reset(): Promise<void>;
}
