/**
 * 批次关联组件
 *
 * @interface IContainerAssociateComponentExpose
 */

export interface IContainerAssociateComponentExpose {
  /**
   * 获取已选择关联批次数据
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
