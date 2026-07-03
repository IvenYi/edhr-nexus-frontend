import {
  BpmnNodeTypeEnum,
  ButtonTypeEnum,
  OpinionTypeEnum,
  ApproveWayEnum,
  DismissRuleEnum,
  SignatureTypeEnum,
  CaseValueType,
  CaseOperatorEnum,
  CaseValueSource,
} from '../enums';
import type { GctFlowNode } from '../../../../src/types/index.d.ts';
import { FlowNodeTypeEnum, ButtonFlowAction } from '../../../../src/enums';

export interface IGctBpmnNodeStyleConfig {
  /**是否显示按钮名称 */
  hasText: boolean;
  /**是否显示图标 */
  hasIcon: boolean;
  /**按钮type */
  type: string;
  /**是否是危险类型 */
  danger: boolean;
  /** 启用按钮颜色 */
  enableCustomColor: boolean;
  /** 图标 */
  icon: string;
  /** 按钮大小 */
  size: ButtonSize;
  /** 字体颜色 */
  fontColor?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 校验卡控后逻辑类型 */
  controlType: CardControlEnum;
  /** 二次提醒内容 */
  checkContent: '';
}

export interface IGctBpmnButtonConfig {
  /** 是否启用 */
  enable: boolean;
  /** 按钮类型 */
  type: ButtonTypeEnum | string;
  /** 按钮别名 */
  alias?: string;
  /** 签名方式 */
  signatureType?: SignatureTypeEnum;
  /** 退回 */
  dismissTo?: string;
  /**退回规则 */
  dismissRule?: DismissRuleEnum;
  /** 是否是自定义按钮 */
  isCustom: boolean;
  /** 自定义按钮的流转动作 */
  flowAction?: ButtonFlowAction;
  /** 按钮样式 */
  style?: IGctBpmnNodeStyleConfig;
  /** 是否开启审批意见 */
  opinionMode?: ButtonOpinionMode;
  /** 是否需要卡控配置 */
  noControl?: boolean;
  /** 是否开启备注（基础表单按钮用） */
  enableMemo?: boolean;
}

export interface IGctBpmnEventConfig {
  /**	主键 - 修改时必传 */
  id?: string;
  /**	事件标识 */
  key?: string;
  /**	执行资源配置 */
  executeResourceConfig?: any;
  /** 执行资源id */
  executeResourceId?: string;
  /** 执行资源类型（脚本/编排/内置/页面脚本) */
  executeResourceType?: string;
  /** 执行方式(异步/同步) */
  executeType?: string;
  /** 关联关系id ，修改时必传 */
  relationId?: string;
  /** 关联关系类型（PROC_DEF：流程版本定义/PROC_NODE_DEF：节点定义） */
  relationType?: 'PROC_DEF' | 'PROC_NODE_DEF';
}

/** 字段权限配置 */
type FieldConfig = {
  /** 字段key */
  field: string | undefined;
  /** 字段名称 */
  fieldName: string | undefined;
  /** 模型key */
  modelKey: string | undefined;
  /** 是否是子表 */
  subModel: number;
  /** 编辑 */
  edit: boolean;
  /** 只读 */
  readonly: boolean;
};

/** 用户组的权限配置 */
export interface PermissionConfig {
  /** 名称 */
  name: string;

  /** 权限等级 */
  permissionLevel: number;

  /** 描述 */
  desc: string;

  /** 权限成员  全部成员 0 自定义1 */
  memberPermissionSelect: 0 | 1;

  /** 自定义成员权限列表 */
  memberPermission?: string;

  /** 字段权限 保持表单中设计状态 0 自定义1 */
  fieldPermissionSelect: 0 | 1;

  /** 自定义字段权限列表 */
  fieldPermission?: FieldPermissionConfig[];

  /** 创建时间 */
  modifyTime?: string;
}

/**
 * BPMN节点定义
 * @see: http://paas.dev.gct-paas.com/gct-apaas/doc.html#/apaas%E5%B9%B3%E5%8F%B0API/%E6%B5%81%E7%A8%8B%E5%AE%9A%E4%B9%89%E7%89%88%E6%9C%AC/insertUsingPOST_1
 */
export interface IGctBpmnNodeDefinition {
  key: string;
  name?: string;
  description?: string;
  type: BpmnNodeTypeEnum;
  webPageKey?: string;
  mobilePageKey?: string;
  buttonConfig?: Array<IGctBpmnButtonConfig>;
  fieldConfig?: Array<FieldConfig>;
  permissionConfig?: Array<PermissionConfig>;
  approveWay?: ApproveWayEnum;
  targetUserConfig?: string;
  opinionConfig?: {
    enabled: boolean;
    opinionType: Array<OpinionTypeEnum | string>;
  };
  msgTmplKey?: string;
  forkConfig?: any;
  events?: Array<IGctBpmnEventConfig>;
  msgContentConfig?: {
    content: string;
    placeholder: Array<{ key: string; name: string; type: string }>;
    contentName: string;
  };
  prevKey?: string;
  nextKey?: string;
  interactiveMode?: 'sync' | 'async';
}

export interface ICondition {
  type: CaseValueType; // 基础类型
  fType?: string; // 模型中的字段类型
  operator: CaseOperatorEnum;
  lType: CaseValueSource; // 左值来源
  lValue?: string;
  lSubFieldType?: string; // 左子表字段类型
  lSubValue?: string; // 左子表字段值
  lSubIndex?: number; // 左子表字段索引
  lSubOperator?: CaseOperatorEnum; // 左子表字段运算符
  lSubType?: CaseValueType;
  rType?: CaseValueSource;
  rValue?: string;
  rSubValue?: string;
  rSubIndex?: number;
}

/**
 * 条件定义
 */
export interface ICase {
  logicalOperators: 'and' | 'or';
  elements: Array<
    | {
        type: 'condition';
        element: ICondition;
      }
    | {
        type: 'conditionGroup';
        element: ICase;
      }
  >;
}

export interface ICaseFormula {
  exp?: string;
  expEcho?: string;
  relationColumns?: string[];
}

export interface IGctBpmnNode extends GctFlowNode.Basic {
  type: BpmnNodeTypeEnum;
  data: IGctBpmnNodeDefinition;
}

/**
 * 流程节点定义
 */
export namespace GctBpmnNode {
  export interface BpmnStart extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnStart;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnSubmit extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnSubmit;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnBusiness extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnBusiness;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnReceiveTask extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnReceiveTask;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnTransaction extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnTransaction;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnApproval extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnApproval;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnJudge extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnJudge;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnMessage extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnMessage;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnEnd extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnEnd;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnExclusive extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnExclusive;
    data?: IGctBpmnNodeDefinition;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        caseCfg: {
          name: string;
          type?: 'JSON' | 'FORMULA';
          json?: ICase;
          formula?: ICaseFormula;
        };
        children: IGctBpmnNode[];
      }
    >;
  }

  /**
   * 包容开始
   */
  export interface BpmnInclusiveS extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnInclusiveS;
    data?: IGctBpmnNodeDefinition;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        caseCfg: {
          name: string;
          type?: 'JSON' | 'FORMULA';
          json?: ICase;
          formula?: ICaseFormula;
        };
        children: IGctBpmnNode[];
      }
    >;
  }

  /**
   * 包容结束
   */
  export interface BpmnInclusiveE extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnInclusiveE;
    data?: IGctBpmnNodeDefinition;
  }

  /**
   * 并行
   */
  export interface BpmnParallel extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnParallel;
    data?: IGctBpmnNodeDefinition;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        caseCfg: {
          name: string;
          type?: 'JSON' | 'FORMULA';
          json?: ICase;
          formula?: ICaseFormula;
        };
        children: IGctBpmnNode[];
      }
    >;
  }
}

export interface ITransformOpts {
  /** 流程定义id */
  processId?: string;
}

export interface ITransformResult {
  xml: string;
  nodes: any[];
}
