/**
 * 批次查询组件
 * @interface IContainerSearchComponentExpose
 */
export interface IContainerSearchComponentExpose {
  /**
   * 获取批次选中信息
   *
   * @return {*}  {object}
   */
  getValue(): object;

  /**
   * 赋值批次信息
   *
   * @param {object} value
   */
  setValue(value: object): void;

  /**
   * 追加批次信息
   * @param {object} value
   */
  addValue(value: object): void;

  /**
   * 重置加载批次列表数据
   * 清空批次选择信息、显示信息
   */
  reset(): void;

  /**
   * 清空工作流高亮节点
   */
  restNodesHighlight(): void;

  /**
   * 设置批次工作流高亮节点
   * @param {string} nodeId 节点id
   */
  setNodeHighlight(nodeId: string): void;
}
