/**
 * 多行文本框组件
 *
 * @interface ITextareaComponentExpose
 */
export interface ITextareaComponentExpose {
  /**
   * 设置内容值
   *
   * @param {string} value
   */
  setValue(value: string): void;

  /**
   * 获取内容值
   *
   * @return {*} {string}
   */
  getValue(): string;
}
