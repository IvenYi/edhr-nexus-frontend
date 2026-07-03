/**
 * 工作流节点
 *
 * @interface IWorkflowNodesComponentExpose
 */
export interface IWorkflowNodesComponentExpose {
  /**
   * 重置节点高亮
   *
   */
  restNodesHighlight(): void;
  /**
   * 设置节点高亮
   *
   * @param { string} nodeId 
   */
  setNodeHighlight(nodeId: string): void;
}
