export type ButtonType = 'primary' | 'default' | 'ghost' | 'dashed' | 'link' | 'text' | 'error';

export enum ButtonTextEnum {
  DETAIL = 'viewDetails',
  PREVIEW = 'preview',
  DELETE = 'delete',
  EDIT = 'edit',
  DESIGN = 'design',
}

export interface ActionsType {
  type?: ButtonType;
  text: ButtonTextEnum;
  icon: string;
  ghost?: boolean;
  danger?: boolean;
}
