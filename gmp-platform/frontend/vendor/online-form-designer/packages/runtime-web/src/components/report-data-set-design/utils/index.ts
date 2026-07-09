import { IdentifierItemInterface } from '/@/components/Expression';

export { getLabelSvgCfg } from './get-label-svg-cfg';
export { formulaToJson, jsonToFormula, type FormulaJsonItem } from './transform-formula';

/**
 * 按 modelKey 分组，生成父子结构的字段标识符
 */
export function groupFieldsByModel(fields: IObject[]): IdentifierItemInterface[] {
  const groupMap = new Map<string, IdentifierItemInterface[]>();
  const modelKeyToNameMap = new Map<string, string>();

  // 按 source.modelKey 分组
  fields.forEach((field) => {
    const modelKey = field.source.modelKey;
    if (!groupMap.has(modelKey)) {
      groupMap.set(modelKey, []);
      modelKeyToNameMap.set(modelKey, field.modelName);
    }
    groupMap.get(modelKey)!.push({
      id: field.source.fieldKey,
      name: field.fieldName || field.fieldLabel,
      valueType: field.source.fieldType,
    } as IdentifierItemInterface);
  });

  // 转换为父子结构
  const result: IdentifierItemInterface[] = [];
  groupMap.forEach((children, modelKey) => {
    result.push({
      id: modelKey,
      name: modelKeyToNameMap.get(modelKey) || modelKey,
      children,
    } as IdentifierItemInterface);
  });

  return result;
}
