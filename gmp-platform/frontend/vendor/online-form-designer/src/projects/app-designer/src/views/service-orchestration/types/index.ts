import { Emitter } from '/@/utils/mitt';

export enum NodeTypeEnum {
  START = 'start',
  END = 'end',
  MODEL_CREATE = 'model-create',
  MODEL_SUBMIT = 'model-submit',
}

export enum ModelSubmitReturnEnum {
  NONE = 'none',
  INSTANCE = 'instance',
  INSTANCE_ID = 'instance_id',
}

export enum PanelTypeEnum {
  BASIC_INFO = 'BASIC_INFO',
  GLOBAL_SETTING = 'GLOBAL_SETTING',
  CONTROL_RPOPS = 'CONTROL_RPOPS',
}

export enum EmitterEnum {
  CONTROL_CHANGE = 'CONTROL_CHANGE',
}

export interface NodeConfigInterface {
  value: NodeTypeEnum | 'default';
  name: string;
  size: {
    width: number;
    height: number;
  };
  isShow: boolean;
}

export interface RegisterOptionsInterface {
  graphContainer: HTMLElement;
  dndContainer: HTMLElement;
  // emitter: any;
}

/**
 * 参数数据结构
 */
export interface ParameterStructItem {
  key: string | number;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  desc?: '';
  children?: ParameterStructItem[];
}
export type ParameterStruct = ParameterStructItem[];

/**
 * 变量类型
 */
export enum VariableTypeEnum {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOL = 'BOOL',
  DATETIME = 'DATETIME',
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  NULL = 'NULL',
}

/**
 * 全局变量
 */
export interface VariableInterface {
  name: string;
  type: VariableTypeEnum;
  defaultValue: string;
  description?: string;
}

/**
 * 编排JSON
 */
// export interface Interface {
//   variables: VariableInterface[];
// }

// export interface SoObject {

// }
