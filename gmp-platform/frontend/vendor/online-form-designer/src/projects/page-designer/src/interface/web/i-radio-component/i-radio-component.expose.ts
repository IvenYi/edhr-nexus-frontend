/**
 * 单选框组件
 *
 * @interface IRadioComponentExpose
 */
export interface IRadioComponentExpose {
  /**
   * 设置选中的选项
   *
   * @param {string} value
   */
  setValue(value: string): void;

  /**
   * 获取选中值
   *
   * @param {{ option?: boolean }} { option } 是否为选项模式
   * @return {*}  {(string[] | IObject[])} option = true 返回对象数组，option = false 返回字符串数组
   */
  getValue({ option }: { option?: boolean }): string[] | IObject[];
}
