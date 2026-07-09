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
  DismissToEnum,
  ButtonEventsEnum,
} from '../enums/index.ts';
import type { GctFlowNode } from '../../../types/index';
import { FlowNodeTypeEnum } from '../../../enums/index.ts';

export interface IGctBpmnButtonConfig {
  /** 是否启用 */
  enable: boolean;
  /** 按钮类型 */
  type: ButtonTypeEnum;
  /** 按钮别名 */
  alias?: string;
  /** 签名方式 */
  signatureType?: SignatureTypeEnum;
  /** 退回 */
  dismissTo?: DismissToEnum;
  /**退回规则 */
  dismissRule?: DismissRuleEnum;
  /**需要签名 */
  signature: boolean;
}

export interface IGctBpmnEventConfig {
  /**	主键 - 修改时必传 */
  id?: string;
  /**	事件标识 */
  key?: ButtonEventsEnum;
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

/**
 * BPMN节点定义
 * @see: http://paas.dev.gct-paas.com/gct-apaas/doc.html#/apaas%E5%B9%B3%E5%8F%B0API/%E6%B5%81%E7%A8%8B%E5%AE%9A%E4%B9%89%E7%89%88%E6%9C%AC/insertUsingPOST_1
 */
export interface IGctBpmnNodeDefinition {
  key?: string;
  name?: string;
  nextKey?: string;
  prevKey?: string;
  description?: string;
  type?: BpmnNodeTypeEnum | 'global';
  webPageKey?: string;
  webViewPageKey?: string;
  mobilePageKey?: string;
  mobileViewPageKey?: string;
  buttonConfig?: Array<IGctBpmnButtonConfig>;
  fieldConfig?: Object<{
    [key]: {
      permission: String;
      children?: Object<{
        [key]: {
          permission: String;
        };
      }>;
    };
  }>;
  approveWay?: ApproveWayEnum;
  targetUserConfig?: string;
  opinionConfig?: {
    enabled: boolean;
    opinionType: Array<OpinionTypeEnum | string>;
  };
  msgTmplKey?: string;
  service?: string;
  forkConfig?: any;
  events?: Array<IGctBpmnEventConfig>;
  onlineFormTmplId?: string;
  onlineFormModelKey?: string;
  builtinMsgEnabled?: number;
  msgReceiverConfig?: string;
  i18n?: string;
}

export interface ICondition {
  type: CaseValueType; // 基础类型
  fType?: string; // 模型中的字段类型
  operator: CaseOperatorEnum;
  lType: CaseValueSource; // 左值来源
  lValue?: string;
  rType?: CaseValueSource;
  rValue?: string;
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

export interface ICaseJson {
  dataRule: string;
  dataRuleConfig: string;
}

export interface IGctBpmnNode extends GctFlowNode.Basic {
  type: BpmnNodeTypeEnum;
  data?: IGctBpmnNodeDefinition;
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

  export interface BpmnApproval extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnApproval;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnJudge extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnJudge;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnJs extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnJs;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnMessage extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnMessage;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnJoin extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnJoin;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnEnd extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnEnd;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnForm extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnForm;
    data?: IGctBpmnNodeDefinition;
  }

  export interface BpmnBusiness extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnBusiness;
    data?: IGctBpmnNodeDefinition;
  }

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

  export interface BpmnExclusive extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnExclusive;
    data?: IGctBpmnNodeDefinition;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        caseCfg: {
          name: string;
          type?: 'JSON' | 'FORMULA';
          json?: ICaseJson;
          formula?: ICaseFormula;
          i18n?: string;
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
