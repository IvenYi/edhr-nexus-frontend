import { defineComponent, h } from 'vue';

export enum ExpressionModeEnum {
  SEARCH,
  FIELD_DISPLAY,
  EXPORT_TEMPLATE,
  DISPLAY_RULE,
  PROCESS_TITLE,
  GATEWAY_RULE,
  CREATE_FIELD,
  PAAS_CREATE_FIELD,
  ENTITY_FORMULA,
  IPAAS_BACK,
  LABEL_PRINT,
  NOCODE_BPMN_RULE,
  PAAS_BPMN_RULE,
  ONLINE_FORM_FIELD_FORMULA,
  MEDPRO_BUSINESSFLOW,
  RUN_FORMULA,
  BI_FORMULA,
  DATA_SET_FORMULA,
  EDHR_LABEL_PRINT,
}

export enum ExpressionTabEnum {
  FUNCTION = 'function',
  FORM = 'form',
  FIELD = 'field',
  VARIABLE = 'variable',
  NODE = 'node',
  OPERATOR = 'operator',
  PARAMS = 'params',
}

export enum OperatorTypeEnum {
  ARITHMETIC = 'arithmetic',
  RELATIONSHIP = 'relationship',
  LOGIC = 'logic',
  OTHER = 'other',
}

export enum VarTypeEnum {
  INNER_VAR = 'INNER_VAR',
  SYSTEM_VAR = 'SYSTEM_VAR',
  GLOBAL_VAR = 'GLOBAL_VAR',
  PAGE_VAR = 'PAGE_VAR',
}

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

export enum IdentifierAddon {
  Prefix = '\u200b',
  Suffix = '\u200b',
  ZeroWidth = '\u200b',
}

export interface IdentifierItemInterface {
  id: string;
  name: string;
  desc?: string;
  valueType?: string;
  type?: string;
  _id_?: string;
  _name_?: string;
  _type_?: ExpressionTabEnum;
  _args_?: number;
}

export interface IdentifierGroupInterface {
  id: string;
  name: string;
  _id_?: string;
  _name_?: string;
  idToChildren?: boolean;
  children: IdentifierItemInterface[];
}

export type IdentifiersInterface = {
  [key in ExpressionTabEnum]?: Array<IdentifierGroupInterface | IdentifierItemInterface>;
};

type ExpressionOptions = {
  expr?: string;
  exprEcho?: string;
  returnType?: string;
  modelKey?: string;
  fieldProps?: Record<string, any>;
  callback?: (expr: string, exprEcho?: string, options?: Record<string, any>) => void;
};

export const ExpressionCard = defineComponent({
  name: 'HostedExpressionCard',
  props: {
    value: String,
  },
  setup(props) {
    return () => h('span', props.value || '');
  },
});

export function calc(expression = '') {
  return expression;
}

export function useExpression() {
  const openModal = (options: ExpressionOptions = {}) => {
    const expr = options.expr || '';
    const exprEcho = options.exprEcho || expr;
    options.callback?.(expr, exprEcho, {
      expr,
      exprEcho,
      returnType: options.returnType,
      modelKey: options.modelKey,
      fieldProps: options.fieldProps,
    });
  };

  return { openModal };
}

export default useExpression;
