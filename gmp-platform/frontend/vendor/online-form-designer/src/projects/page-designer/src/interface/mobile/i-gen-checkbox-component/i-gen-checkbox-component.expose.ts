/**
 * 复选框组件
 *
 * @interface IMobGenCheckboxComponentExpose
 */
export interface IMobGenCheckboxComponentExpose {
  /**
   * 设置选中的选项
   *
   * @param {string | Array<any>} value
   */
  setValue(value: string | Array<any>): void;

  /**
   * 获取选中的选项
   *
   * @return {*} {string | Array<any>}
   */
  getValue(): string | Array<any>;
}
