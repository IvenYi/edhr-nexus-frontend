/**
 * 数据列表
 *
 * @interface IDataListComponentExpose
 */
export interface IDataListComponentExpose {
  /**
   * 重新加载数据
   *
   * @param {string} id
   * @return {*}  {Promise<void>}
   */
  reload(id?: string): Promise<void>;

  /**
   * 获取选中值
   *
   * @return {*}  {string}
   */
  getValue(): string;

  /**
   * 设置选中值
   *
   * @param {string} id
   */
  setValue(id?: string): void;
}
