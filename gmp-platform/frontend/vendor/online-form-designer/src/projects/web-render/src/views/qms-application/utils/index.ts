import { cloneDeep, isNil, isPlainObject } from 'lodash-es';
import { useStorage } from '@vueuse/core';
import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
/**
 * 格式化数字，保留指定位数小数
 * @param {number} value - 要格式化的值
 * @param {number} [decimal=2] - 保留的小数位数，默认2位
 * @param {string} [fallback='--'] - 默认回显内容
 * @param {boolean} [useGrouping=false] - 是否使用分组分隔符
 * @returns {string} 格式化后的字符串
 */
export function formatDecimal(value, decimal = 2, fallback = '', useGrouping = false) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const num = Number(value);
  if (isNaN(num)) {
    return fallback;
  }

  if (String(num).includes('e')) {
    return num.toFixed(decimal);
  }

  // 格式化小数位数
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
    useGrouping
  });
}
/**
 * 深度合并两个对象，优先使用B对象的值
 * @param {Object} a - 第一个对象
 * @param {Object} b - 第二个对象
 * @returns {Object} 合并后的新对象
 */
export function deepMergeWithBPriority(a, b) {
  const result = cloneDeep(a) || {};

  for (const key in b) {
    if (b.hasOwnProperty(key)) {
      const aValue = a ? a[key] : undefined;
      const bValue = b[key];
      if (isPlainObject(bValue)) {
        result[key] = deepMergeWithBPriority(aValue, bValue);
      } else {
        result[key] = !isNil(bValue) && bValue !== '' ? bValue : aValue;
      }
    }
  }
  return result;
}

/** 获取文本宽度 */
export function getTextWidth(text, font = '12px Arial') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return 0;
  }
  context.font = font;
  const textWidth = context.measureText(text).width;
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas?.remove?.();
  return textWidth;
}

/** 获取失控判异规则 */
export async function getOutOfRuleEnums() {
  const rulesEnums = useStorage('outOfRulesEnums', [], sessionStorage) as any;
  if (!rulesEnums.value || !rulesEnums.value?.length) {
    try {
      const res = await getEnumModelFieldPageList({
        enumModelId: 'enu_out_of_control_rule',
        enumModelKey: 'enu_out_of_control_rule',
      });
      const enums = (res?.data ?? []).map((it) => {
        return {
          ...it,
          label: it.text,
          value: it.value,
        };
      });
      rulesEnums.value = enums;
    } catch (error) {
      rulesEnums.value = [];
    }
  }
  return rulesEnums.value
}