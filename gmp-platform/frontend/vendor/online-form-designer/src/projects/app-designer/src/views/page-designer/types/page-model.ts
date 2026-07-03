export type ButtonType =
  | 'primary'
  | 'default'
  | 'ghost'
  | 'dashed'
  | 'link'
  | 'text'
  | 'error'
  | 'tooltip';

export enum ButtonTextEnum {
  DETAIL = 'viewDetails',
  PREVIEW = 'preview',
  DELETE = 'delete',
  EDIT = 'edit',
  DESIGN = 'design',
  COPY = 'copy',
}

export interface ActionsType {
  type?: ButtonType;
  text: ButtonTextEnum;
  icon?: string;
  // 只在 tooltip 类型下生效
  svgIcon?: string;
  ghost?: boolean;
  danger?: boolean;
  tooltip?: string;
}
