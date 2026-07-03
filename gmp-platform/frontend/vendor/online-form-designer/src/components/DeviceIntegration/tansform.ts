import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { FIELD_TYPE } from '@gct/runtime';

export function useTransformByField({
  fieldInfo,
  fieldType,
  masterFieldMap,
  precision,
  format,
  isMaster,
}) {
  // 处理字段值的转换
  async function transformFieldValue(data: object) {
    if (!fieldInfo.value) return Promise.reject();
    const { field } = fieldInfo.value;
    if (!(field in data)) return Promise.reject(`字段 ${field} 不存在`);
    // 普通字段转化处理
    const value = convertFieldValue(data[field], fieldType);
    //子表数组映射处理
    if (isMaster && Array.isArray(value)) {
      value?.forEach((item: any) => {
        for (const key in masterFieldMap.value) {
          if (item.hasOwnProperty(key)) {
            const mappedKey = masterFieldMap.value[key];
            item[mappedKey] = item[key];
          }
        }
      });
    }
    console.log('转换后的值', value);
    return value;
  }
  // 转换字段值的通用函数
  function convertFieldValue(value: any, fieldType: FIELD_TYPE) {
    switch (fieldType) {
      case FIELD_TYPE.LONG:
      case FIELD_TYPE.INTEGER:
      case FIELD_TYPE.DECIMAL:
        return convertToNumber(value);
      case FIELD_TYPE.DOUBLE:
        return isNaN(value) ? null : parseFloat(value);
      case FIELD_TYPE.BOOLEAN:
        return convertToBoolean(value);
      case FIELD_TYPE.DATE_TIME:
      case FIELD_TYPE.DATE:
        return convertToDate(value);
      default:
        return value;
    }
  }
  // 字符串转数字
  function convertToNumber(value: any): any {
    if (isNaN(value)) return null;
    try {
      return value ? new BigNumber(value).toFixed(precision, 1) : null;
    } catch (error) {
      return null;
    }
  }

  // 字符串转布尔值
  function convertToBoolean(value: any): boolean {
    if (['false', '0'].includes(String(value).toLowerCase())) return false;
    return !!value; // 默认为原值
  }

  // 转换为日期对象
  function convertToDate(value: any): string {
    try {
      const d = normalizeToDayjs(value);
      return d ? d.format(format) : '';
    } catch {
      return '';
    }
  }

  return { transformFieldValue };
}
function normalizeToDayjs(value: any) {
  if (value == null || value === '') return null;

  // number 类型
  if (typeof value === 'number') {
    // 秒级时间戳
    if (value < 1e12) {
      return dayjs.unix(value);
    }
    // 毫秒级时间戳
    return dayjs(value);
  }

  // string 类型
  if (typeof value === 'string') {
    const str = value.trim();

    // 纯数字字符串
    if (/^\d+$/.test(str)) {
      // 年份
      if (str.length === 4) {
        return dayjs(`${str}-01-01`);
      }

      const num = Number(str);

      // 秒级
      if (str.length === 10) {
        return dayjs.unix(num);
      }

      // 毫秒级
      if (str.length === 13) {
        return dayjs(num);
      }
    }

    // 兜底正常日期字符串
    const d = dayjs(str);
    return d.isValid() ? d : null;
  }

  // 其他类型（Date、Dayjs）
  const d = dayjs(value);
  return d.isValid() ? d : null;
}
