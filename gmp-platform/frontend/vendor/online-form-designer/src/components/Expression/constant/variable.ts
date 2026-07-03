import { FIELD_TYPE } from '@gct/runtime';
import { IdentifierItemInterface } from '../types/index';

/**
 * 系统变量前缀
 */
export const SYSTEM_VAR_PREFIX = '$SYSTEM_VAR_';

/**
 * 内置变量
 */
export const innerVarList: IdentifierItemInterface[] = [
  {
    id: '$USERID',
    name: '$USERID',
    valueType: 'string',
    desc: '当前登录人id',
  },
  {
    id: '$USERNAME',
    name: '$USERNAME',
    valueType: 'string',
    desc: '当前登录人姓名',
  },
  {
    id: '$USERDEPARTMENTID',
    name: '$USERDEPARTMENTID',
    valueType: 'string',
    desc: '当前登录人主部门',
  },
  {
    id: '$USERDEPARTMENTNAME',
    name: '$USERDEPARTMENTNAME',
    valueType: 'string',
    desc: '当前登录人主部门名称',
  },
];

export const innerVarIds = innerVarList.map((item) => item.id);

// 数字类型字段
export const numberTypes: string[] = [
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.QTY_CONSUMED,
  FIELD_TYPE.QTY_REQUIRED,
  FIELD_TYPE.QTY,
];

// 布尔类型字段
export const booleanTypes: string[] = [FIELD_TYPE.BOOLEAN];
