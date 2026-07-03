import {
  BpmnNodeTypeEnum,
  ConnectorType,
  EndpointType,
  HttpMethod,
  MetaTypeEnum,
  OperatorEnum,
  PanelStep,
  ParamType,
  QuartzType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
  TriggerType,
} from '../enums/index.ts';
import type { GctFlowNode } from '../../../types/index';
import { FlowNodeTypeEnum } from '@gct/flow/src/enums';
import { ConditionOperatorEnum, ConditionTypeEnum } from '/@/projects/ipaas/src/enums/index.js';

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
export interface IGctBpmnNode extends GctFlowNode.Basic {
  type: BpmnNodeTypeEnum;
  data?: NodeDataSchema.Base;
}

/**
 * 流程节点定义
 */
export namespace GctBpmnNode {
  export interface BpmnTrigger extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnTrigger;
    data?: NodeDataSchema.Trigger;
  }
  export interface BpmnConnector extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnConnector;
    data?: NodeDataSchema.Connector;
  }

  export interface BpmnScript extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnScript;
    data?: NodeDataSchema.Connector;
  }

  export interface BpmnApiResponse extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnApiResponse;
    data?: NodeDataSchema.ApiResponse;
  }

  export interface BpmnParallel extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnParallel;
    data?: NodeDataSchema.Parallel;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        children: IGctBpmnNode[];
      }
    >;
  }

  export interface BpmnExclusive extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnExclusive;
    data?: NodeDataSchema.Exclusive;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        children: IGctBpmnNode[];
      }
    >;
  }
  export interface BpmnLoop extends IGctBpmnNode {
    type: BpmnNodeTypeEnum.BpmnLoop;
    data?: NodeDataSchema.Loop;
    children: Array<
      GctFlowNode.Basic & {
        type: FlowNodeTypeEnum.Flow;
        children: IGctBpmnNode[];
      }
    >;
  }
}

export interface ITransformResult {
  xml: string;
  nodes: any[];
}

interface ICondition {
  type: 'condition';
  element: {
    left?: string;
    type: ConditionTypeEnum;
    operator: ConditionOperatorEnum;
    right?: string;
  };
}

interface IConditionGroup {
  type: 'conditionGroup';
  element: IConditionRoot;
}

interface IConditionRoot {
  logicalOperators: 'and' | 'or';
  elements: Array<ICondition | IConditionGroup>;
}

/**
 * 分支中条件
 */
export interface IConditionItem {
  left: string | number | boolean;
  metaType: MetaTypeEnum;
  operator: OperatorEnum;
  right: string | number | boolean;
}

/**
 * 节点业务数据 后台用
 */
export namespace NodeBizDataSchema {
  export interface Base {
    nodeId?: string;
    nodeName?: string;
    nodeDescription?: string;
    endpointType?: EndpointType;
    nodeConfig: object;
    appType?: string;
  }

  export interface Webhook extends Base {
    endpointType?: EndpointType.webhook;
    nodeConfig: {
      requestMethod: RequestMethod;
      path: string;
      responseMethod: ResponseMethod;
      headerParameters: any[];
      queryParameters: any[];
      body: any[];
      outputBody: any[];
    };
  }

  export interface Cron extends Base {
    endpointType?: EndpointType.scheduleTrigger;
    nodeConfig: {
      quartzType: QuartzType.CRON;
      cronPattern: string;
      isValid?: boolean;
    };
  }

  export interface BaseHttp extends Base {
    endpointType: EndpointType.baseHttp;
    nodeConfig: {
      httpMethod: HttpMethod;
      paramType: ParamType;
      authId?: string;
      path: '';
      connectTimeOut: number;
      encode: 'UTF_8';
      uriParameters: any[];
      headerParameters: any[];
      queryParameters: any[];
      body: any[];
    };
  }

  export interface DB extends Base {
    endpointType: EndpointType.db;
    nodeConfig: {
      dsKey?: string;
      env?: string;
      sql?: string;
      dsId?: string;
      tenantId?: string;
    };
  }

  export interface ApiConnector extends Base {
    endpointType: EndpointType.apiConnector;
    nodeConfig: {
      httpConfig?: {
        protocol: string;
        host: string;
        port?: string;
      };
      appType: string;
      httpMethod: HttpMethod;
      paramType: ParamType;
      authId: string;
      path: string;
      dynamicDomain: number;
      // connectTimeOut?: number;
      // encode?: 'UTF_8';
      uriParameters: any[];
      headerParameters: any[];
      queryParameters: any[];
      body: any[];
    };
  }

  export interface ModelBs extends Base {
    endpointType: EndpointType.modelBs;
    nodeConfig: {
      appType: string;
      appTag?: string;
      env?: string;
      branchId?: string;
      uriParameters: any[];
      headerParameters: any[];
      queryParameters: any[];
      body: any[];
      dataType?: string;
      modelCategory?: 'entity' | 'data' | 'view';
      modelKey?: string;
      bsKey?: string;
    };
  }

  export interface Ldap extends Base {
    endpointType: EndpointType.ldap;
    nodeConfig: {
      authId?: string;
      baseDn?: string;
      objectClass?: string;
      filter?: string;
      scope: string;
      branchId: string;
      env: string;
      platformAppId: string;
    };
  }
  export interface SapRfc extends Base {
    endpointType: EndpointType.sapRfc;
    nodeConfig: {
      /** 连接器id */
      authId?: string;
      /** 平台的应用Id */
      platformAppId: string;
      /** 平台的分支id */
      branchId: string;
      /** 平台的环境 */
      env: string;
      /** rfc函数名称 */
      functionName?: string;
      /** rfc参数 */
      import: any[];
    };
  }

  export interface DoWhile extends Base {
    endpointType: EndpointType.doWhile;
    nodeConfig: {
      dataType?: string;
      content?: object;
      start?: object;
      end?: object;
      split?: string;
      range: number;
      max: number;
      stopOnException: boolean;
      breakNodeId: string;
    };
  }

  export interface Platform extends Base {
    endpointType: EndpointType.platform;
    nodeConfig: {
      apiId?: string;
      tenantId?: string;
      objectClass?: string;
      defaultOrgName?: string;
      defaultOrgId?: string;
      body: any[];
    };
  }

  export interface ApiResponse extends Base {
    endpointType: EndpointType.apiResponse;
    nodeConfig: {
      responseParamType: ResponseParamType;
      headerParameters: any[];
      body: any[];
    };
  }

  export interface Switch extends Base {
    endpointType: EndpointType.condition;
  }

  export interface If extends Base {
    endpointType: EndpointType.if;
    nodeConfig: IConditionRoot;
  }

  export interface Else extends Base {
    endpointType: EndpointType.else;
  }

  export interface Parallel extends Base {
    endpointType: EndpointType.parallel;
  }

  export interface Exclusive extends Base {
    endpointType: EndpointType.condition;
  }

  export interface Script extends Base {
    endpointType: EndpointType.script;
    nodeConfig: {
      // 脚本参数
      arguments: Array<{
        key: string;
        value: string;
      }>;
      // 脚本内容
      tsCode?: string;
      script: string;
      returnKeys: Array<{
        id: string;
        key: string;
        isDeleted?: boolean; // 是否删除
        isNew?: boolean; // 是否新增
      }>;
    };
  }
}

export namespace NodeDataSchema {
  export interface Base {
    key?: string;
    name?: string;
    nextKey?: string;
    prevKey?: string;
    description?: string;
    type?: BpmnNodeTypeEnum;
    step?: PanelStep;
    bizData: NodeBizDataSchema.Base;
  }

  export interface Trigger extends Base {
    type: BpmnNodeTypeEnum.BpmnTrigger;
    triggerType?: TriggerType;
    bizData: NodeBizDataSchema.Webhook | NodeBizDataSchema.Cron;
  }

  export interface Connector extends Base {
    type: BpmnNodeTypeEnum.BpmnConnector;
    connector?: ConnectorType;
    bizData:
      | NodeBizDataSchema.Base
      | NodeBizDataSchema.BaseHttp
      | NodeBizDataSchema.ApiConnector
      | NodeBizDataSchema.ModelBs
      | NodeBizDataSchema.Ldap
      | NodeBizDataSchema.SapRfc
      | NodeBizDataSchema.DB
      | NodeBizDataSchema.Platform;
  }

  export interface Script extends Base {
    type: BpmnNodeTypeEnum.BpmnScript;
    bizData: NodeBizDataSchema.Script;
  }

  export interface ApiResponse extends Base {
    type: BpmnNodeTypeEnum.BpmnApiResponse;
    bizData: NodeBizDataSchema.ApiResponse;
  }

  export interface Parallel extends Base {
    type: BpmnNodeTypeEnum.BpmnParallel;
    bizData: NodeBizDataSchema.Base;
  }

  export interface Exclusive extends Base {
    type: BpmnNodeTypeEnum.BpmnExclusive;
    bizData: NodeBizDataSchema.Base;
  }

  export interface Loop extends Base {
    type: BpmnNodeTypeEnum.BpmnLoop;
    bizData: NodeBizDataSchema.Base;
  }

  // export interface Switch extends Base {
  //   fNode: FlowNodeTypeEnum.Switch;
  //   bizData: NodeBizDataSchema.Switch;
  // }

  // export interface Condition extends Base {
  //   fNode: FlowNodeTypeEnum.Condition;
  //   bizData: NodeBizDataSchema.Base | NodeBizDataSchema.If | NodeBizDataSchema.Else;
  // }
}
