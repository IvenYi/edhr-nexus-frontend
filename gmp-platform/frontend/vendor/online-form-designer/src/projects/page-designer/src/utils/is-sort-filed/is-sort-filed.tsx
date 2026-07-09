import { FIELD_TYPE } from '@gct/runtime';

/**
 *
 *
 * @author zhanghanrui
 * @date 2024-09-04 09:09:08
 * @export
 * @param {string} fieldType 字段类型, 只支持[文本、整数、长整数、小数、精度小数、日期、时间、日期时间、布尔、人员关联、人员多选、部门关联、部门多选、枚举关联、枚举多选、模型关联、模型多选、版本模型关联、公式、汇总、序列号]
 * @return {*}  {boolean}
 */
export function isSortFiled(fieldType: string): boolean {
  switch (fieldType) {
    case FIELD_TYPE.TEXT:
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
    case FIELD_TYPE.DATE:
    case FIELD_TYPE.TIME:
    case FIELD_TYPE.DATE_TIME:
    case FIELD_TYPE.BOOLEAN:
    case FIELD_TYPE.USER:
    case FIELD_TYPE.USER_MULTI:
    case FIELD_TYPE.ORG:
    case FIELD_TYPE.ORG_MULTI:
    case FIELD_TYPE.ENUM:
    case FIELD_TYPE.ENUM_MULTI:
    case FIELD_TYPE.REF:
    case FIELD_TYPE.REF_MULTI:
    case FIELD_TYPE.RDO_REF:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.SERIAL:
    case FIELD_TYPE.DOCUMENT_TEMPLATE:
    case FIELD_TYPE.PRINTER:
    case FIELD_TYPE.TRANSACTION:
    case FIELD_TYPE.MESSAGE_TMPL:
    case FIELD_TYPE.RANGE_USER:
      return true;
    default:
      return false;
  }
}
