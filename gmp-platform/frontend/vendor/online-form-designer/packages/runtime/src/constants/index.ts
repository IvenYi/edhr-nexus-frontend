export { DefaultDateTypeConst } from './default-date-type/default-date-type';
export { EditorRegisterConst } from './editor-register/editor-register';
export { EditorType } from './editor-type/editor-type';
export { FormContainerType } from './form-container-type/form-container-type';
export { GCT_DND_INSERT_POS } from './gct-dnd/gct-dnd';

export const APP_INST = 'app_inst';

/** 数据类型 */
export enum ValueTypeEnum {
  /** 固定值 */
  FIXED = 'FIXED',
  /** 系统变量 */
  SYS = 'SYS',
  /** 字段*/
  FIELD = 'FIELD',
  /** 变量*/
  VAR = 'VAR',
}

export const FORM_CONTROLLER_INJECT_TAG = 'formController';
