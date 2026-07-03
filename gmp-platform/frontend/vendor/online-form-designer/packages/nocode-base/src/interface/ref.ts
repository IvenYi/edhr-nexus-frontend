export const refUtils = {
  /** 数据筛选生成查询条件 */
  generateQueryConditions: (
    dataFilter: {
      dataRule: string;
      dataRuleConfig: string;
      dataRuleEnabled: boolean;
    },
    paramsConfig: Record<string, any> = {},
  ) => {
    // 空值安全检查和默认值初始化
    const DEFAULT_RETURN = {
      /** 数据筛选的exp */
      dataFilterExp: '',
      /** 数据筛选固定值 */
      dataFilterFixedQueryData: {},
      /** 数据筛选字段值 */
      dataFilterVarQueryData: {},
    };

    try {
      if (!dataFilter.dataRule) {
        return DEFAULT_RETURN;
      }

      const dataRule = JSON.parse(dataFilter.dataRule);
      if (!dataRule || typeof dataRule !== 'object') {
        return DEFAULT_RETURN;
      }
      const { typeMap = {}, query = {}, exp = '' } = dataRule;
      const fixedData = {};
      const varData = {};

      Object.entries(query).forEach(([key, value]) => {
        const type = typeMap[key];

        switch (type) {
          case 'FIELD':
            varData[key] = value;
            break;
          case 'COMP_PARAMS':
          case 'BUILT_PARAMS':
            fixedData[key] = paramsConfig?.[value as string] ?? undefined;
            break;
          default:
            fixedData[key] = value;
        }
      });

      return {
        dataFilterExp: exp,
        dataFilterFixedQueryData: fixedData,
        dataFilterVarQueryData: varData,
        dataFilterVarFields: Object.values(varData)
          .map((v: string) => v.split(':')?.[1])
          .filter(Boolean),
      };
    } catch (error) {
      return DEFAULT_RETURN;
    }
  },

  /** exp拼接 */
  splicingExp: (dataFilterExp, ...args) => {
    const expList = [dataFilterExp, ...args].filter((i) => i);
    const expKey = expList.join(',');
    if (expList.length > 1) {
      return `AND(${expKey})`;
    } else {
      return expKey;
    }
  },

  getQuickQueryDataByKeyWord: ({ quickSearchField, keyword }) => {
    return (
      quickSearchField?.reduce((total, filedKey: string) => {
        const expKey = filedKey.split('.').length > 1 ? filedKey : filedKey + '.like';
        total[expKey] = keyword;
        return total;
      }, {}) || {}
    );
  },
};
