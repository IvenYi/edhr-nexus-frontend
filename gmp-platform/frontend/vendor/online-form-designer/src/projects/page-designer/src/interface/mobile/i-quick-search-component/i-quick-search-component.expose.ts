/**
 * 快速搜索组件
 *
 * @interface IQuickSearchComponentExpose
 */
export interface IQuickSearchComponentExpose {
  /**
   * 设置搜索条件
   *
   * @param {string} value
   */
  setSearchValue(value: string): void;
  /**
   * 搜索框自动获取焦点
   *
   */
  setSearchFocus(): void;
  /**
   * 获取搜索条件
   *
   * @return {*}  {string}
   */
  getSearchValue(): string;

  /**
   * 获取查询条件
   *
   * @return {*} {IObject}
   */
  getBodyBySearch(): IObject;
}
