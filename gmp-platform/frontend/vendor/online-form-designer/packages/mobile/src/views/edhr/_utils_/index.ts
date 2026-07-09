import { cloneDeep } from 'lodash-es';

/**
 * 查询 tab 的数据转化
 * @param value
 * @param defaultTabs
 * @returns
 */
export interface ITab {
  id: string;
  type: string;
  name: string;
  color: string;
  icon: string;
  count: number;
  queryFields: Record<
    string,
    {
      valueType: string;
      rawValue?: any;
      field: string;
      ope: string[];
    }
  >;
}
interface IContent {
  hiddenTabs?: string[];
  customTabs?: ITab[];
  builtinTabs?: ITab[];
}
export function queryTabsParse(value?: string, defaultTabs: ITab[]) {
  if (!value) return defaultTabs;
  const content: IContent = JSON.parse(value);
  return [...(content.builtinTabs ?? defaultTabs), ...(content.customTabs ?? [])].filter(
    (item) => !(content.hiddenTabs ?? []).includes(item.id),
  );
}

/**
 * @param config
 * @returns
 */
export const formatQuery = (config: ITab) => {
  const { queryFields } = config;
  const query: Record<string, any> = {};
  Object.keys(queryFields).forEach((key) => {
    const { field, ope, rawValue } = queryFields[key];
    if (rawValue && field && ope && ope[0]) {
      query[`${field}.${ope[0]}:${key}`] = rawValue;
    }
  });
  return query;
};

/**
 *
 * @param sourceData
 * @param i18nData
 * @returns
 */
export function transformSourceData(sourceData, i18nData) {
  const cloneSourceData = cloneDeep(sourceData);

  const _DICT = i18nData
    ? Object.keys(cloneSourceData).reduce((total, curr) => {
        const map = i18nData[curr],
          value = cloneSourceData[curr];
        if (map && value) {
          try {
            const label = value.split(',').map((k) => map[k]);
            total[curr] = { [value]: label };
          } catch (error) {}
        }
        return total;
      }, {})
    : cloneSourceData._DICT || {};

  return {
    ...cloneSourceData,
    _DICT,
    _OPCT: cloneSourceData.__FOREIGN__
      ? transformSourceData(cloneSourceData.__FOREIGN__, i18nData)
      : {},
    __FOREIGN__: null,
  };
}
