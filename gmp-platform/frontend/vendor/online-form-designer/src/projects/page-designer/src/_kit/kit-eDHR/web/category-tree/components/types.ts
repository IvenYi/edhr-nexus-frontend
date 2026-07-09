export interface NodeItem {
  title: string;
  key: string;
  disableState?: boolean; // 禁用状态图标
  stateColor?: string; // 状态图标颜色
  disableNodeIcon?: boolean; // 禁用节点图标
  nodeIcon?: string; // 节点图标
  [key: string]: any;
}
