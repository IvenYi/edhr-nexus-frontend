import { isNil, keyBy, pick } from 'lodash-es';

// 指定长度和基数
export const uuid2 = (len, radix?: any) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid: any = [],
    i;
  radix = radix || chars.length;
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;
    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
};

export const normalizeToArray = (val) =>
  Array.isArray(val) ? val.filter((v) => !isNil(v)) : !isNil(val) ? [val] : [];

export const safeParseArray = (str) => {
  try {
    if (!str) return [];
    const v = JSON.parse(str);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/**
 * 合并两个按钮数组
 * @param {Array} A - 基础数组
 * @param {Array} B - 更新数组
 * @param {Object} options
 * @param {string[]} options.keyFields - 用于唯一匹配的字段
 * @param {string[]} options.fieldsToMerge - 从 B 合并到 A 的字段
 * @param {boolean} options.isAllowMerge - 是否允许合并
 * @param {boolean} options.isConcat - 如果 A数组是空是否直接用B 数组
 * @returns {Array} 合并后的数组
 */
export const mergeByMultiKey = (
  A,
  B,
  {
    keyFields = ['type', 'isCustom'],
    fieldsToMerge = ['alias', 'enable'],
    isAllowMerge = true,
    isConcat = false,
  } = {},
) => {
  if (!Array.isArray(A)) return [];
  if (!isAllowMerge || !Array.isArray(B) || B.length === 0) return [...A];
  if (isConcat && Array.isArray(A) && A.length === 0) return [...B];

  const keyFn = (item) =>
    keyFields
      .map((k) => {
        const v = item?.[k];
        if (typeof v === 'boolean') return String(v);
        return v == null ? '' : String(v);
      })
      .join('::');

  const bMap = keyBy(B, keyFn);

  const result = A.map((a) => {
    const info = bMap[keyFn(a)];
    return info ? { ...a, ...pick(info, fieldsToMerge) } : { ...a };
  });

  return result;
};

export const getRowId = (row: any) => {
  if (!row) return '';
  if (!isNil(row.id_)) return row.id_;

  const ROW_UID_KEY = '__gct_rv_uid';

  if (!row[ROW_UID_KEY]) {
    row[ROW_UID_KEY] = `r_${Date.now()}_${uuid2(8)}`;
  }
  return row[ROW_UID_KEY];
};
