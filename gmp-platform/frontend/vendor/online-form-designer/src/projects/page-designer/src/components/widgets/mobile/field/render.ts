import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
import readonlycmp from './readonlycmp/readonlycmp-render.vue';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { FormComponents } from '/@page-designer/enum';

type componentMap = Record<string, () => Promise<Component>>;

const renderModules: componentMap = import.meta.glob(`../field/**/*-render.{vue,tsx}`);
const renderTableModules: componentMap = import.meta.glob(`../field/**/*-render-table.{vue,tsx}`);
const renderMap = new Map();
const renderTableMap = new Map();

init(renderModules, renderMap, '-render');
init(renderTableModules, renderTableMap, '-render-table');

function init(m: componentMap, map, design) {
  Object.entries(m).forEach(([path, value]) => {
    const fileNameWithExtension = path.split('/').pop()!;
    const fileNameWithoutExtension = fileNameWithExtension.split(design).slice(0, -1).join('.');
    fileNameWithoutExtension &&
      map.set('gct-' + fileNameWithoutExtension, defineAsyncComponent(value));
  });
}

/**只读字字段走的自读组件 */
const readonlyFieldType = [
  // FIELD_TYPE.ORG,
  // FIELD_TYPE.ORG_MULTI,
  // FIELD_TYPE.USER,
  // FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.ESOP,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.PRIMARY_KEY,
  FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
  // FIELD_TYPE.DOCUMENT_TEMPLATE,
  // FIELD_TYPE.LABEL_TEMPLATE_REF,
];
/**排除组件只需要的默认只读组件 */
const excludeTypeComponents: FormComponents[] = [FormComponents.Radio, FormComponents.Checkbox];
export function getRenderComponentByType(
  type: FormComponents,
  fieldType: FIELD_TYPE,
  rowReadonly: boolean,
  returnType?: string,
) {
  if (
    rowReadonly &&
    readonlyFieldType.includes(fieldType) &&
    !excludeTypeComponents.includes(type)
  ) {
    return readonlycmp;
  }
  const ReturnType = {
    form: renderMap,
    table: renderTableMap,
  };
  const key = 'gct-' + type;
  return (
    (returnType && ReturnType[returnType]
      ? ReturnType[returnType].get(key)
      : renderTableMap.get(key)) || renderMap.get(key)
  );
}
