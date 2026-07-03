import { FormComponents } from '@gct/runtime';

/**
 * 基础白名单，所有容器组件通用
 */
export const baseWhiteList: string[] = [
  FormComponents.Collapse,
  FormComponents.Grid,
  FormComponents.GridCol,
  FormComponents.LayoutContainer,
  FormComponents.LeftRightColumns,
  FormComponents.Tabs,
];

/**
 * 容器子项通用白名单
 */
export const containerBaseWhiteList: string[] = [
  ...baseWhiteList,
  FormComponents.Form,
  FormComponents.RdoForm,
];
