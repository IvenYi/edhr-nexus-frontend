/**
 * 工作流节点元素类型
 */
export enum WorkflowNodeTypeEnum {
  NODE_START = 'NODE_START',
  NODE_END = 'NODE_END',
  NODE_SPEC = 'NODE_SPEC', // 工艺节点
  NODE_GROUP = 'NODE_GROUP', // ?组合节点
  NODE_WORKFLOW = 'NODE_WORKFLOW', // 工作流节点
  PATH_MAIN = 'PATH_MAIN', // 主流程线
  PATH_OPTIONAL = 'PATH_OPTIONAL', // 备选线
  PATH_BACK = 'PATH_REWORK', // 返工线
  PATH_PARALLEL = 'PATH_PARALLEL', // 并行线
}

export enum IEmitEventEnum {
  ADD,
  EDIT,
  DELETE,
  SELECTED,
  MOUNTED,
}

export enum NodeStateEnum {
  WAITING = 2, // 未开始
  RUNNING = 1, // 进行中
  FINISHED = 0, // 已完成
}

interface Data {
  node_id_: string;
  group_node_id_?: string;
  node_config_?: string;
}
export interface IEmitEventData {
  data: Data | ((...ary: any[]) => Data);
  type: IEmitEventEnum;
}

/**
 * 组件属性
 */
export interface IWidgetProps {
  widgetId: string;
  modelKey: string;
  readonly?: boolean;
}

/**
 * 工作流子节点行数据
 */
export interface IWorkflowNodeRow {
  name_?: string;
  spec_id_?: string;
  type_: WorkflowNodeTypeEnum;
  sub_workflow_?: string;
  node_id_: string;
  group_node_id_?: string;
  source_node_id_?: string;
  target_node_id_?: string;
  node_config_: string;
  description_?: string;
  link_?: string;
}
