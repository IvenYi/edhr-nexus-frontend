import { FIELD_TYPE } from '@gct/runtime';
import { DataSetReturnTypeEnum } from '/@/components/Expression';

/**
 * 除去不需要的字段，true 为需要，false 不需要
 *
 * @description 去除的类型：图片、整数、长整数、小数、精度小数、汇总（返回值 整数、长整数、精度小数）、公式（返回值 整数、长整数、精度小数、自建公式（返回数值）
 * @export
 * @param {string} type
 * @returns {*}  {boolean}
 */
export function filterType(type: string, mappingType?: string): boolean {
  switch (type) {
    case FIELD_TYPE.IMAGE:
    case FIELD_TYPE.SIGNATURE:
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.FUNCTION:
      const isSkip = () => {
        if (type === FIELD_TYPE.AGG || type === FIELD_TYPE.EXPRESSION) {
          switch (mappingType) {
            case FIELD_TYPE.INTEGER:
            case FIELD_TYPE.LONG:
            case FIELD_TYPE.DECIMAL:
              return true;
            default:
              return false;
          }
        }
        // 自建公式（返回数值）
        if (type === FIELD_TYPE.FUNCTION) {
          switch (mappingType) {
            case DataSetReturnTypeEnum.Double:
              return true;
            default:
              return false;
          }
        }
        return true;
      };
      if (isSkip()) {
        return false;
      }
    default:
      return true;
  }
}
