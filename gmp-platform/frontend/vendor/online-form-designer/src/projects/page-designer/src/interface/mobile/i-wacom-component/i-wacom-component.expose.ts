/**
 * 手写板组件
 *
 * @interface IMobWacomComponentExpose
 */
export interface IMobWacomComponentExpose {
  /**
   * 获取选中值
   *
   * @return {*}  {string | undefined}
   */
  getValue(): string | undefined;
  /**
   * 设置选中值
   *
   * @param { string} value 选中项标识数组
   */
  setValue(value: string): void;

  /**
   * 清除手写板
   *
   */
  clear(): void;
}
