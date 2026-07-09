import { FlowNodeTypeEnum } from '@gct/flow';
import {
  PanelStep,
  IPaasNodeType,
  EndpointType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
  TriggerType,
  QuartzType,
  HttpMethod,
  ParamType,
  MetaTypeEnum,
  OperatorEnum,
  ConnectorType,
  AppTypes,
  ConditionTypeEnum,
} from '../enums';

interface ICondition {
  type: 'condition';
  element: {
    left: string | number | boolean;
    type: ConditionTypeEnum;
    operator: ConditionOperatorEnum;
    right?: string | number | boolean;
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
    nodeId: string;
    nodeName: string;
    nodeDescription: string;
    endpointType?: EndpointType;
    nodeConfig: object;
  }

  export interface Webhook extends Base {
    endpointType: EndpointType.webhook;
    nodeConfig: {
      requestMethod: RequestMethod;
      path: string;
      responseMethod: ResponseMethod;
      // headerParameters: any[];
      // queryParameters: any[];
      // body: any[];
      // outputBody: any[];
      metaHeader?: string;
      metaQuery?: string;
      metaBody?: string;
      metaUri?: string;
    };
  }

  export interface Cron extends Base {
    endpointType: EndpointType.scheduleTrigger;
    nodeConfig: {
      quartzType: QuartzType.CRON;
      cronPattern: string;
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

  export interface ApiConnector extends Base {
    endpointType: EndpointType.apiConnector;
    nodeConfig: {
      httpMethod: HttpMethod;
      paramType: ParamType;
      appType?: AppTypes;
      authId?: string;
      path: '';
      connectTimeOut: number;
      encode: 'UTF_8';
      uriParameters: any[];
      headerParameters: any[];
      queryParameters: any[];
      body: any[];
      appTag?: string;
      tenantId?: string;
      branchId?: string;
      env?: string;
    };
  }

  export interface ModelBs extends Base {
    endpointType: EndpointType.modelBs;
    nodeConfig: {
      appType?: AppTypes;
      authId?: string;
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

/**
 * 节点数据 前端用
 */
export namespace NodeDataSchema {
  export interface Base {
    fNode: FlowNodeTypeEnum;
    type?: IPaasNodeType;
    steps?: PanelStep[];
    step?: PanelStep;
    bizData: NodeBizDataSchema.Base;
  }

  export interface Trigger extends Base {
    fNode: FlowNodeTypeEnum.App;
    type: IPaasNodeType.Trigger;
    triggerType?: TriggerType;
    bizData: NodeBizDataSchema.Base | NodeBizDataSchema.Webhook | NodeBizDataSchema.Cron;
  }

  export interface Connector extends Base {
    fNode: FlowNodeTypeEnum.App;
    type: IPaasNodeType.Connector;
    connector?: ConnectorType;
    bizData: NodeBizDataSchema.Base | NodeBizDataSchema.BaseHttp;
  }

  export interface ApiResponse extends Base {
    fNode: FlowNodeTypeEnum.App;
    type: IPaasNodeType.ApiResponse;
    bizData: NodeBizDataSchema.ApiResponse;
  }

  export interface Switch extends Base {
    fNode: FlowNodeTypeEnum.Switch;
    bizData: NodeBizDataSchema.Switch;
  }

  export interface Condition extends Base {
    fNode: FlowNodeTypeEnum.Condition;
    bizData: NodeBizDataSchema.Base | NodeBizDataSchema.If | NodeBizDataSchema.Else;
  }
}
