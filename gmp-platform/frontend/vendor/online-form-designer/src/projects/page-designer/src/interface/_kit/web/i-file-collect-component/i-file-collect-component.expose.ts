/**
 * 文档集组件
 * @interface IFileCollecComponentExpose
 */

export interface IFileCollecComponentExpose {
  /**
   * 获取选中项
   * @return {Array<object>}
   */
  getValue(): Array<object>;

  /**
   * 重载数据
   */
  reload(): void;

  /**
   * 数据清空
   */
  reset(): void;
}