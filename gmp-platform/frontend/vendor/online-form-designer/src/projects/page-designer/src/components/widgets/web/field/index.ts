import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
import readonlycmp from './readonlycmp/readonlycmp-render.vue';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { FormComponents } from '/@page-designer/enum';
//表格列字段渲染
type componentMap = Record<string, () => Promise<Component>>;
const designModules: componentMap = import.meta.glob(`../field/**/*-design.{vue,tsx}`);
const renderModules: componentMap = import.meta.glob(`../field/**/*-render.{vue,tsx}`);
const renderTableModules: componentMap = import.meta.glob(`../field/**/*-render-table.{vue,tsx}`);
const designTableModules: componentMap = import.meta.glob(`../field/**/*-design-table.{vue,tsx}`);

const renderMap = new Map();
const designMap = new Map();
const designTableMap = new Map();
const renderTableMap = new Map();
init(designModules, designMap, '-design');
init(renderModules, renderMap, '-render');
init(renderTableModules, renderTableMap, '-render-table');
init(designTableModules, designTableMap, '-design-table');

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
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.PRINTER,
  // FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.ESOP,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.PRIMARY_KEY,
  FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,

  // RDO 需要显示默认标签
  // FIELD_TYPE.DOCUMENT_TEMPLATE,
  // FIELD_TYPE.LABEL_TEMPLATE_REF,
];
/**部分组件只需要的默认只读组件 */
const readonlyTypeComponents: FormComponents[] = [];
/**排除组件只需要的默认只读组件 */
const excludeTypeComponents: FormComponents[] = [FormComponents.Radio, FormComponents.Checkbox];
export function getRenderComponentByType(
  type: FormComponents,
  fieldType: FIELD_TYPE,
  rowReadonly: boolean,
) {
  /** 表格指定字段类型 或者 指定的组件 可以走只读组件的逻辑 */
  if (
    rowReadonly &&
    !excludeTypeComponents.includes(type) &&
    (readonlyFieldType.includes(fieldType) || readonlyTypeComponents.includes(type))
  ) {
    return readonlycmp;
  }
  const key = 'gct-' + type;
  return renderTableMap.get(key) || renderMap.get(key);
}

export function getDesignComponentByType(type: string) {
  const key = 'gct-' + type;
  return designTableMap.get(key) || designMap.get(key);
}
