import { FIELD_TYPE, CreateType } from '../../enums';
const fieldMap = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.OPTION,
  FIELD_TYPE.OPTION_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
];
/**公式的过滤字段 */
export const formulaFilter = (i: any) => {
  return (
    CreateType.SYSTEM === i.createType ||
    (CreateType.USER_DEFINED === i.createType && fieldMap.includes(i.type)) ||
    (CreateType.BUILTIN === i.createType &&
      (i.initCommitId === '__0000__' || ['description_', 'version_', 'name_'].includes(i.key)))
  );
};

const deptMap = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.OPTION,
  FIELD_TYPE.OPTION_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.EXPRESSION,
  FIELD_TYPE.AGG
];
/**組件依賴的过滤字段 */
export const deptFilter = (i: any) => {
  return (
    CreateType.SYSTEM === i.createType ||
    (CreateType.USER_DEFINED === i.createType && deptMap.includes(i.type)) ||
    (CreateType.BUILTIN === i.createType &&
      (i.initCommitId === '__0000__' || ['description_', 'version_', 'name_', 'show_type_', 'type_'].includes(i.key))) // 新版edhr需要
  );
};