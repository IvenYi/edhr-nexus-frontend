import { FormComponents, LowCodeWidget } from '@gct/runtime';

// 容器类型的组件
const containerTypes: string[] = [
  FormComponents.Collapse,
  FormComponents.ButtonContainer,
  FormComponents.LayoutContainer,
  FormComponents.Grid,
  FormComponents.GridCol,
  FormComponents.LeftRightColumns,
  FormComponents.Tabs,
  FormComponents.TabPane,
];

/**
 * 递归获取所有子组件类型
 *
 * @param {LowCodeWidget.BasicSchema} item
 * @param {string[]} [types=[]]
 * @returns {*}  {string[]}
 */
function deepFindTypes(item: LowCodeWidget.BasicSchema, types: string[] = []): string[] {
  if (item.type) {
    types.push(item.type);
  }
  if (
    (!item.type || containerTypes.includes(item.type)) &&
    item.children &&
    item.children.length > 0
  ) {
    item.children.forEach((child: any) => {
      deepFindTypes(child, types);
    });
  }
  return types;
}

/**
 * 返回包含自身以及子的所有组件类型集合
 *
 * @export
 * @param {LowCodeWidget.BasicSchema} item
 * @returns {*}  {string[]}
 */
export function findAllChildrenTypes(item: LowCodeWidget.BasicSchema): string[] {
  const types = deepFindTypes(item);
  const set = new Set(types);
  return Array.from(set);
}
