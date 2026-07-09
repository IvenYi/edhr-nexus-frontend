import { cloneDeep, merge } from 'lodash-es';
/**
 * table 后端返回的分页 数据处理
 * @param data 数据信息
 * @param dict 翻译信息
 * @returns
 */
export function transformSourceData(
  data,
  dict,
): { _DICT: object; _OPCT: object; [key: string]: any }[] {
  const list = data?.map((i) => transformData(i, dict));
  return list || [];
}

/**
 * 表单  form  数据处理
 * @param data 数据信息
 * @param dict 翻译信息
 * @returns
 */
export function transformData(row: any = {}, dict: object = {}) {
  const data = cloneDeep(row);
  data._X_ROW_KEY = undefined;
  const _DICT = Object.keys(dict ?? {})?.length
    ? Object.keys(data).reduce((total, curr) => {
        const map = dict[curr],
          value = data[curr];
        if (map && value) {
          try {
            const label = value.split(',').map((k) => map[k]);
            total[curr] = { [value]: label };
          } catch (error) {}
        }
        return total;
      }, {})
    : data._DICT || {};
  return {
    ...data,
    _DICT,
    _OPCT: data.__FOREIGN__ ? transformData(data.__FOREIGN__, dict) : {},
    // __FOREIGN__: null,
  };
}
export function addDataByForm(formState, data, dict) {
  if (typeof data !== 'object') return;
  const formdata = transformData(data, dict);
  merge(formState, formdata);
}
export function setDataByForm(formState, data, dict) {
  if (typeof data !== 'object') return;
  for (const k in formState) {
    if (k !== '_OPCT' && k !== '_NOSUBMIT') {
      delete formState[k];
    }
  }
  const formdata = transformData(data, dict);
  //存在 _X_ROW_KEY 的时候需要保留 ，子表编辑校验的时候需要做对比
  formdata._X_ROW_KEY = data._X_ROW_KEY;
  merge(formState, formdata);
}

/**
 * 表单  select  数据处理
 * @param data 数据信息
 * @param dict 翻译信息
 * @returns
 */
export function transSelectData(field, row: any = {}, dict: object = {}) {
  const data = cloneDeep(row.__FOREIGN__ || row);
  const _OPCT = { _DICT: {} };
  Object.keys(data).forEach((curr) => {
    const fieldkey = `${field}.${curr}`;
    const map = dict[curr],
      value = data[curr];
    if (map && value) {
      try {
        const label = value.split(',').map((k) => map[k]);
        _OPCT._DICT[fieldkey] = { [value]: label };
      } catch (error) {}
    }
    _OPCT[fieldkey] = value;
  });
  return {
    ...data,
    _OPCT,
  };
}

/**
 * 表单  form  数据f翻译不保留原始信息
 * @param data 翻译信息
 * @returns
 */
export function transformDataToDict(row: any = {}, dict: object = {}) {
  const data = cloneDeep(row);
  return Object.keys(dict ?? {})?.length
    ? Object.keys(data).reduce((total, curr) => {
        const map = dict[curr],
          value = data[curr];
        try {
          total[curr] = value
            .split(',')
            .map((k) => map[k])
            .join('，');
        } catch (error) {
          total[curr] = value;
        }
        return total;
      }, {})
    : data;
}

/**
 * 应用国际化
 * @param widget 组件配置信息
 * @param t 翻译方法
 */
export function applyWidgetI18n(
  widget: { i18n?: Record<string, string>; props: Record<string, any> },
  t: (key: string) => string,
) {
  if (!widget?.i18n) return;
  const i18n = widget.i18n;
  for (const k in i18n) {
    const i18nKey = i18n[k];
    if (i18nKey) {
      widget.props[k] = t(i18nKey);
    }
  }
}