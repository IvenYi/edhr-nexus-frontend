/**
 * 选项框组件
 *
 * @interface IMobCheckboxComponentExpose
 * @extends {IGctComponent}
 */
export interface IMobCheckboxComponentExpose {
  /**
   * 获取选项值
   *
   * @param {{ option?: boolean }} { option }
   * @return {*}  {(string[] | IObject[])}
   */
  getValue({ option }: { option?: boolean }): string[] | IObject[];
  /**
   * 设置选项值
   *
   * @param {string[]} value
   */
  setValue(value: string[]): void;
}
