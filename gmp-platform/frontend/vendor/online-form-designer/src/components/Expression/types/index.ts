import { FIELD_TYPE } from '/@/enums/appEnum';

/**
 * 使用场景
 */
export enum ExpressionModeEnum {
  SEARCH, // 搜索条件
  FIELD_DISPLAY, // 字段显示规则
  EXPORT_TEMPLATE, // 导出模版
  DISPLAY_RULE, // 显隐规则
  PROCESS_TITLE, // 流程标题
  GATEWAY_RULE, // 网关
  CREATE_FIELD, // 创建字段
  PAAS_CREATE_FIELD, // paas平台创建字段
  ENTITY_FORMULA, // 实体-公式字段
  IPAAS_BACK, // 用于 ipaas 后端计算用
  LABEL_PRINT, // 标签打印文本字段配置
  NOCODE_BPMN_RULE, // 无代码流程条件规则
  PAAS_BPMN_RULE, // 低代码审批流
  ONLINE_FORM_FIELD_FORMULA, // 电子表单字段公式
  MEDPRO_BUSINESSFLOW, //medpro 业务流
  RUN_FORMULA, //组件-公式计算字段字段
  BI_FORMULA, // BI公式字段函数
  DATA_SET_FORMULA, // 数据集公式字段函数
  EDHR_LABEL_PRINT, // edhr标签模板
}

export type ModeTabMapInterface = {
  [key in ExpressionModeEnum]: ExpressionTabEnum[];
};

export enum ExpressionTabEnum {
  FUNCTION = 'function', // 函数
  FORM = 'form', // 表单
  FIELD = 'field', // 字段
  VARIABLE = 'variable', // 变量
  NODE = 'node', // 节点
  OPERATOR = 'operator', // 运算符
  PARAMS = 'params', // 参数
}

export enum OperatorTypeEnum {
  /**算术 */
  ARITHMETIC = 'arithmetic',
  /**关系 */
  RELATIONSHIP = 'relationship',
  /**逻辑 */
  LOGIC = 'logic',
  /**其他 */
  OTHER = 'other',
}
export enum VarTypeEnum {
  INNER_VAR = 'INNER_VAR',
  SYSTEM_VAR = 'SYSTEM_VAR',
  GLOBAL_VAR = 'GLOBAL_VAR',
  PAGE_VAR = 'PAGE_VAR',
}

export interface IdentifierItemInterface {
  id: string; // 标识符、下划线中英数字
  name: string; // 名称/下划线中英数字
  desc?: string; // 说明
  valueType?: FIELD_TYPE | string; // 返回值的类型
  type?: FIELD_TYPE | string; // 返回值的类型
  _id_?: string;
  _name_?: string;
  _type_?: ExpressionTabEnum;
  _args_?: number;
}

export interface IdentifierGroupInterface {
  id: string; // 标识符、下划线中英数字
  name: string; // 名称/下划线中英数字
  _id_?: string;
  _name_?: string;
  idToChildren?: boolean; // 默认true
  children: IdentifierItemInterface[];
}

export type IdentifiersInterface = {
  [key in ExpressionTabEnum]?: Array<IdentifierGroupInterface | IdentifierItemInterface>;
};
export enum ReturnTypeEnum {
  String = 'string',
  Number = 'number',
  Boolen = 'boolean',
}

export enum DataSetReturnTypeEnum {
  String = 'string',
  Double = 'number',
}

export enum EntityFormulaReturnTypeEnum {
  Text = 'text',
  LongText = 'long_text',
  Int = 'integer',
  Long = 'long',
  Double = 'decimal',
  Boolen = 'boolean',
}

interface CallbackOptions {
  expr: string;
  exprEcho: string;
  exprName?: string;
  returnType?: ReturnTypeEnum | EntityFormulaReturnTypeEnum;
  modelKey?: string;
  fieldProps?: {
    /**小数位数 */
    digits?: number;
    /**布尔值真 */
    trueText?: string;
    /**布尔值假 */
    falseText?: string;
  };
}
export interface ExpressionInterface {
  expr?: string; // 表达式
  exprEcho?: string; // 表达式显示内容
  exprName?: string; // 表达式名称
  returnType?: ReturnTypeEnum | EntityFormulaReturnTypeEnum | DataSetReturnTypeEnum; // 表达式类型
  disabledReturnType?: boolean; // 表达式返回值类型是否可编辑
  modalTitle?: string; // 模态框title
  mode: ExpressionModeEnum; // 使用场景
  identifiers: IdentifiersInterface;
  modelKey?: string; //默认模型
  fieldProps?: {
    /**小数位数 */
    digits?: number;
    /**布尔值真 */
    trueText?: string;
    /**布尔值假 */
    falseText?: string;
  };
  callback?: (expr: string, exprEcho?: string, options?: CallbackOptions) => void; // 回调函数
  beforeClose?: (
    expr: string,
    exprEcho: string,
    returnType: string,
    formState: object,
  ) => Promise<boolean>; // 关闭modal前的方法，返回true，关闭modal，否则，不关闭
}

export enum IdentifierAddon {
  Prefix = '\u200b',
  Suffix = '\u200b',
  ZeroWidth = '\u200b',
}
