/**
 * 事务组件
 *
 * @interface IMobTransactionComponentExpose
 */
export interface IMobTransactionComponentExpose {
  /**
   * 获取选中值
   *
   * @param {{ option?: boolean }} { option } 是否为选项模式
   * @return {*}  {(string[] | string | IObject[])} option = true 返回对象数组，option = false 返回字符串数组
   */
  getValue({ option }: { option?: boolean }): string[] | string | IObject[];
  /**
   * 设置选中值
   *
   * @param {string[] | string} value 选中项标识数组
   */
  setValue(value: string[] | string): void;
}
