import { message } from 'ant-design-vue';
import { cloneDeep, isEmpty, isNil } from 'lodash-es';

export enum ValueType {
  JSON = 'JSON',
}

/** 格式化json数据 */
function formatJson2Notes(value) {
  if (isEmpty(value)) {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

/** 字符串转JSON */
function parseFormattedJson(formattedStr) {
  if (typeof formattedStr !== 'string') return formattedStr;
  try {
    // 尝试标准解析
    return JSON.parse(formattedStr);
  } catch (error) {
    message.error('格式错误，转换成json失败');
    console.error('转换错误', error, formattedStr);
    throw error;
  }
}

export function getValueTransfer(valueType: ValueType) {
  return {
    valueToStr: (val) => {
      if (isNil(val)) {
        return '';
      }
      if (valueType === ValueType.JSON) {
        return formatJson2Notes(val);
      }
      return '';
    },
    strToValue: (str) => {
      if (valueType === ValueType.JSON) {
        return parseFormattedJson(str);
      }
      return undefined;
    },
  };
}

export const ModelLanguageMap = {
  [ValueType.JSON]: 'json',
};
