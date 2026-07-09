import dayjs from 'dayjs';
import { BindCmpStyleEnum, FIELD_TYPE } from '@gct/runtime';
import { formatValueByTimeType } from '../format-value-by-time-type/format-value-by-time-type';

/**
 * 字段值格式化选项
 */
export interface FormatFieldValueOptions {
  /** 字段定义 */
  field: {
    type: string;
    mappingType?: string;
  };
  /** 格式化配置 */
  format?: string;
  /** 编辑器类型 */
  editorType?: string;
  /** 货币符号 */
  currency?: string;
  /** 时间类型 */
  timeType?: string;
}

/**
 * 格式化字段值
 *
 * @author chitanda
 * @date 2025-06-25 17:06:45
 * @export
 * @param {any} text 原始值
 * @param {FormatFieldValueOptions} options 格式化选项
 * @returns {string} 格式化后的值
 */
export function formatFieldValue(text: any, options: FormatFieldValueOptions): string {
  if (!options.field) return String(text || '');

  const { field, format, editorType, currency, timeType } = options;

  // 处理时间、日期相关字段类型的格式化
  if (format) {
    if (
      field.type === FIELD_TYPE.TIME ||
      (field.type === FIELD_TYPE.AGG && field.mappingType === FIELD_TYPE.TIME)
    ) {
      try {
        return dayjs(`1999-01-01 ${text}`).format(format);
      } catch (error) {
        console.warn('时间格式化失败:', error);
      }
    }

    if (
      field.type === FIELD_TYPE.DATE_TIME ||
      field.type === FIELD_TYPE.DATE ||
      (field.type === FIELD_TYPE.AGG &&
        (field.mappingType === FIELD_TYPE.DATE_TIME || field.mappingType === FIELD_TYPE.DATE))
    ) {
      try {
        return dayjs(text).format(format);
      } catch (error) {
        console.warn('日期格式化失败:', error);
      }
    }
  }

  // 数字类型的特殊处理
  if (editorType) {
    if (
      field.type === FIELD_TYPE.DOUBLE ||
      field.type === FIELD_TYPE.DECIMAL ||
      field.type === FIELD_TYPE.INTEGER ||
      field.type === FIELD_TYPE.LONG ||
      (field.type === FIELD_TYPE.AGG && field.mappingType === FIELD_TYPE.DOUBLE) ||
      (field.type === FIELD_TYPE.AGG && field.mappingType === FIELD_TYPE.INTEGER) ||
      (field.type === FIELD_TYPE.AGG && field.mappingType === FIELD_TYPE.LONG) ||
      (field.type === FIELD_TYPE.EXPRESSION && field.mappingType === FIELD_TYPE.DECIMAL) ||
      (field.type === FIELD_TYPE.EXPRESSION && field.mappingType === FIELD_TYPE.INTEGER) ||
      (field.type === FIELD_TYPE.EXPRESSION && field.mappingType === FIELD_TYPE.LONG)
    ) {
      if (editorType === BindCmpStyleEnum.CMP_NUMBER) {
        return String(text);
      } else if (editorType === BindCmpStyleEnum.CMP_CURRENCY) {
        return `${currency || '¥'}${text}`;
      } else if (editorType === BindCmpStyleEnum.CMP_TIME) {
        if (timeType) {
          try {
            const value = parseInt(String(text)?.replace(',', '') || '0');
            if (!isNaN(value)) {
              return formatValueByTimeType(value, timeType);
            }
          } catch (error) {
            console.warn('时间格式化失败:', error);
          }
        }
      }
    }
  }
  if (field.type === FIELD_TYPE.BOOLEAN) {
    return field.specificConfig[text] || '';
  }
  return String(text || '');
}
