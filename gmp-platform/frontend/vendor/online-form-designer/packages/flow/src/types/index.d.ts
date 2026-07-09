import { FlowNodeTypeEnum } from '../enums';

export namespace GctFlowNode {
  export interface Basic {
    id: string;
    type: FlowNodeTypeEnum | string;
    data?: any; // 业务数据
    tooltips?: string[]; // 节点的提示信息
    allowNext?: boolean; // 是否下一节点
    allowDelete?: boolean; //节点是否不能删除，默认可删除
    syncDeleteById?: string; // 同步删除
    hidden?: boolean; // 隐藏节点
    fold?: boolean; // 折叠
  }

  export interface Flow extends Basic {
    type: FlowNodeTypeEnum.Flow;
    children: Basic[];
  }

  export interface App extends Basic {
    type: FlowNodeTypeEnum.App;
  }

  export interface Loop extends Basic {
    type: FlowNodeTypeEnum.Loop;
    children: Flow[];
  }

  export interface Bool extends Basic {
    type: FlowNodeTypeEnum.Bool;
    children: Flow[];
  }
  export interface Switch extends Basic {
    type: FlowNodeTypeEnum.Switch;
    children: Flow[];
  }

  export interface Condition extends Basic {
    type: FlowNodeTypeEnum.Condition;
  }

  export interface End extends Basic {
    type: FlowNodeTypeEnum.End;
  }
}

export interface IGctFlowOptions {
  data?: GctFlowNode.Flow;
  readonly?: boolean;
  instMode?: boolean; // 实例模式，带有节点状态、路径颜色
  actions?: Array<{
    key: string;
    name: string;
    icon: string;
    color: string;
    hide?: boolean | ((props) => boolean);
  }>;
  onNodeCreate?: any;
  onNodeClick?: any;
}

export type NodeInstStatusMap = Record<
  string,
  {
    status: FlowNodeInstStatus;
    data?: any;
    renderPopover?: Function;
  }
>;
