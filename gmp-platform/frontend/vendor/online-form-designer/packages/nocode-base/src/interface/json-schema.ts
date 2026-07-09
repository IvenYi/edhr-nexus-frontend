import { isNil } from 'lodash-es';
import { JSONPath } from 'jsonpath-plus';

/** JSON Schema 转化 */
function parseJsonSchema(schema, paramsConfig = new Map()) {
  if (!schema || typeof schema !== 'object') return schema;

  switch (schema.type) {
    case 'Object':
      return Object.keys(schema.properties || {}).reduce((acc, key) => {
        acc[key] = parseJsonSchema(schema.properties[key], paramsConfig);
        return acc;
      }, {});

    case 'Array':
      return [parseJsonSchema(schema.items, paramsConfig)];

    default:
      if (schema.paramType === 'Fixed') {
        return schema.paramKey;
      } else if (schema.paramType === 'Mapping') {
        return paramsConfig.get(schema.paramKey);
      }
      return null;
  }
}

/**
 * 处理 subModel = 0 的情况
 * @param {Object} mapItem 配置项（subModel===0时）
 * @param {any} apiData 接口返回的数据
 */
function processJsonSchemaSubModel0(mapItem, apiData) {
  return mapItem.fields.reduce((acc, { leftFieldKey, rightFieldKey }) => {
    let value = JSONPath({ path: rightFieldKey, json: apiData })?.[0];
    value = (Array.isArray(value) ? value[0] : value) ?? undefined;
    acc[leftFieldKey] = typeof value === 'object' ? undefined : value;
    return acc;
  }, {});
}

/**
 * 处理 subModel = 1 的情况
 * @param {Object} mapItem 配置项（subModel===1时）
 * @param {any} apiData 接口返回的数据
 */
function processJsonSchemaSubModel1(mapItem, apiData) {
  // 处理字段值，去除 null 和对象
  const fieldValues = mapItem.fields.reduce((acc, { leftFieldKey, rightFieldKey }) => {
    let value = JSONPath({ path: rightFieldKey, json: apiData });
    let arr = Array.isArray(value)
      ? value.filter((v) => v != null && typeof v !== 'object')
      : value != null && typeof value !== 'object'
      ? [value]
      : [];

    acc[leftFieldKey] = arr;
    return acc;
  }, {});

  // 计算最大数组长度
  const maxLength = Math.max(0, ...Object.values(fieldValues).map((arr) => arr.length));

  return Array.from({ length: maxLength }, (_, i) =>
    Object.entries(fieldValues).reduce((acc, [key, values]) => {
      if (values[i] !== undefined) {
        acc[key] = values[i];
      }
      return acc;
    }, {}),
  );
}

export const jsonSchemaUtils = {
  parseJsonSchema,
  processJsonSchemaSubModel0,
  processJsonSchemaSubModel1,
};
