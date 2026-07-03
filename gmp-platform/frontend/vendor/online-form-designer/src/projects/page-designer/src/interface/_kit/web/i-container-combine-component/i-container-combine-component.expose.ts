/**
 * 批次合并组件
 *
 * @interface IContainerCombineComponentExpose
 */

export interface IContainerCombineComponentExpose {
  /**
   * 获取已选择合并批次数据
   *
   * @return {Array<object>}
   */
  getValue(): Array<object>;

  /**
   *
   * @param {Object} queryData 查询参数
   */
  reload(queryData: object): void;

  /**
   * 重置数据为初始态
   */
  reset(): void;
}
