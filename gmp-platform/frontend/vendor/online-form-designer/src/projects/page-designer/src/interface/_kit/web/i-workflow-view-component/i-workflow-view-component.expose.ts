/**
 * 工作流查看组件
 * @interface IWorkflowViewComponentExpose 
 */

export interface IWorkflowViewComponentExpose {
  /**
   * 设置工作流高亮节点
   * @param {string} nodeId 节点id
   */
  setNodeHighlight(nodeId: string): void;

  /**
   * 清空工作流高亮节点
   */
  restNodesHighlight(): void;
}