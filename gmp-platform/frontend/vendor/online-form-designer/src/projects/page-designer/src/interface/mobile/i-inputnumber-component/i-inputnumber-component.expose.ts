/**
 * 数字输入框
 *
 * @interface IMobInputnumberComponentExpose
 */
export interface IMobInputnumberComponentExpose{
  /**
   * 设置数字输入框的值
   *
   * @param {number} value
   */
  setValue(value: number): void;

  /**
   * 获取数字输入框的值
   *
   * @return {*} {number}
   */
  getValue(): number;
}
