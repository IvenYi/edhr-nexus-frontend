/**
 * 汇总组件
 *
 * @interface IMobAggComponentExpose
 */
export interface IMobAggComponentExpose {
  /**
   * 获取选中值
   *
   * @return {*}  {string | number} option = true 返回对象数组，option = false 返回字符串数组
   */
  getValue(): string | number;
  /**
   * 设置选中值
   *
   * @param {string | number} value 选中项标识数组
   */
  setValue(value: string | number): void;
}
