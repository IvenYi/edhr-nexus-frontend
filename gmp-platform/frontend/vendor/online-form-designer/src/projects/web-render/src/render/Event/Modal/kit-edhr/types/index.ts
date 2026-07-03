import { WorkflowNodeTypeEnum } from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/component/types';

export enum EOpeType {
  ADD = 'add',
  EDIT = 'edit',
  DETAIL = 'detail',
}

export enum EReworkTaskType {
  CONTAINER = 'container',
  SN = 'sn',
}

export interface IReworkModalParams {
  /** 任务类型 */
  taskType: EReworkTaskType;

  /** 事务实例id */
  txn_inst_id_: string;

  sn_id_?: string;

  container_id_?: string;

  routing_id_?: string;

  product_id_: string;

  /** 事务执行主体ID: containerId or snId */
  txnSubjectId?: string;
}

export interface IReworkConfiguration {
  taskType: EReworkTaskType;
  /** 返工任务ID */
  task_id_?: string;
  /** 返工任务名称 */
  name_?: string;
  /** 返工方式 */
  routing_type_?: 'system' | 'custom';
  /** 返工状态 */
  status_: 'waiting' | 'running' | 'finished' | undefined;
  /** 返工数量 */
  qty_: number | null;
  /** 返工任务名称 */
  rework_name_?: string;
  /** 可合并sn */
  sn_ids_?: Array<string>;
  /** 返工描述 */
  description_?: string;
  /** 返工配置 */
  config_?: any[];
  /** 工艺路径节点 */
  routing_id_: string | undefined;

  container_id_?: string;

  sn_id_?: string;

  product_id_?: string;
}

export interface IOperationNode {
  name_: string;
  type_: WorkflowNodeTypeEnum;
  node_id_: string;
  routing_operation_id_?: string;
  node_config_?: string;
  description_?: string;
  link_?: string;
}

export interface IOperationNodeConfig {
  value: any;
  node_id_: string | null;
  routing_operation_id_: string | null;
  form_entries_: Array<any>;
  form_entries_dict_: Record<string, any>;
  document_entries_: Array<any>;
  document_entries_dict_?: Record<string, any>;
  trigger_txn_entries_?: Array<any>;
  trigger_txn_entries_dict_?: Record<string, any>;
  before_txn_check_entries_?: Array<any>;
  before_txn_check_entries_dict_?: Record<string, any>;
  operation_advance_execution_entries_?: Array<any>;
  operation_advance_execution_entries_dict_?: Record<string, any>;
  split_sn_enabled_?: boolean;
  trigger_txn_enabled_?: boolean;
  operation_before_txn_check_enabled_?: boolean;
  operation_advance_execution_enabled_?: boolean;
}

export enum UploadTypeEnum {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  PDF = 'pdf',
  MP4 = 'mp4',
}

export enum FileTypeEnum {
  PICTURE = 'picture',
  PDF = 'pdf',
  VIDEO = 'video',
  IFRAME = 'iframe',
}
