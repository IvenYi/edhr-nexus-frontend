export interface RegisterOptionsInterface {
  graphContainer: HTMLElement;
  dndContainer: HTMLElement;
}

/**
 * 变量类型
 */
export enum VariableTypeEnum {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Object = 'Object',
  Array = 'Array',
  DataTime = 'DataTime',
  Null = 'Null',
}
/**
 * 局部变量
 */
export interface VariableInterface {
  name: string;
  type: VariableTypeEnum;
  defaultValue: string;
  description?: string;
}

// 属性面板
export enum PanelTypeEnum {
  Basic,
  Variable,
  Control,
}

export enum SystemEnum {
  Start = 'system-start',
  End = 'system-end',
}
// 组件
export enum WidgetEnum {
  Modal = 'widget-modal',
  Form = 'widget-form',
  FormComp = 'widget-form-comp',
  DataTable = 'widget-data-table',
}
// 工具
export enum ToolkitEnum {
  Request = 'toolkit-request',
}

export type ControlType = SystemEnum | WidgetEnum | ToolkitEnum;
export interface ControlInterface {
  value: ControlType;
  name?: string;
  size?: {
    width: number;
    height: number;
  };
}

// 逻辑编排基础数据
export interface LoDataObject {
  name: string;
  title: string;
  controls: Record<string, object>; // 控件信息
  variables: VariableInterface[]; // 变量
  graphJSON: object; // 图表JSON
  runtimeJs: string; // 运行时js
  createBy: string;
  createTime: string;
  modifyBy: string;
  modifyTime: string;
  bindTo: string[]; // 被绑定到的组件集合
  /**输入变量 */
  parameter?: string[];
}

export interface BaseControlInterface {
  id: string;
  type: ControlType;
  title: string;
  // size?: {
  //   width: number;
  //   height: number;
  // };
}

export namespace Control {
  export interface ToolkitRequest extends BaseControlInterface {
    model?: string;
    service?: string;
    inputType?: 'variable' | 'custom';
    inputVariable?: string;
    inputParameter?: string;
    resType?: null | 'output';
    outputToVariable?: string;
  }

  export type SystemStart = BaseControlInterface;
  export interface SystemEnd extends BaseControlInterface {
    outputToVariable?: string;
  }
  export interface Widget extends BaseControlInterface {
    belong?: string; // 所属作用域
    widgetId?: string; // 组件id
    widgetType?: string; // 组件类型
    action?: string; // 动作
  }
  export type WidgetModal = Widget;
  export interface WidgetForm extends Widget {
    inputVariable?: string;
    outputToVariable?: string;
  }
  export interface WidgetFormComp extends Widget {
    inputVariable?: string;
    outputToVariable?: string;
  }
  export interface WidgetDataTable extends Widget {
    outputToVariable?: string;
  }
}

export interface ControlRecord {
  [SystemEnum.Start]: BaseControlInterface;
  [SystemEnum.End]: BaseControlInterface;
  [WidgetEnum.Modal]: Control.WidgetModal;
  [WidgetEnum.Form]: Control.WidgetForm;
  [WidgetEnum.FormComp]: Control.WidgetFormComp;
  [WidgetEnum.DataTable]: Control.WidgetDataTable;
  [ToolkitEnum.Request]: Control.ToolkitRequest;
}
