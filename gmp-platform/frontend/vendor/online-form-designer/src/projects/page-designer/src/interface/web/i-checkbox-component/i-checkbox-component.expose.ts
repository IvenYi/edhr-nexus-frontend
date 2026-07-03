/**
 * 选项框组件
 *
 * @interface ICheckboxComponentExpose
 * @extends {IGctComponent}
 */
export interface ICheckboxComponentExpose {
  /**
   * 获取选中值
   *
   * @param {{ option?: boolean }} { option } 是否为选项模式
   * @return {*}  {(string[] | IObject[])} option = true 返回对象数组，option = false 返回字符串数组
   */
  getValue({ option }: { option?: boolean }): string[] | IObject[];
  /**
   * 设置选中值
   *
   * @param {string[]} value 选中项标识数组
   */
  setValue(value: string[]): void;
}
