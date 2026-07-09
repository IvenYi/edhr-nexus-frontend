import {
  DateTimeTypeFormattingEnum,
  DateTimeValueEnum,
  emptyValueEnum,
  SummaryCalculationMethod,
} from './enum';
import { uniq, sum, max, min, mean } from 'lodash-es';
import { FIELD_TYPE } from '@gct/runtime';
import { ReportTable } from './run_table';
import { getReportInfo, getReportUserPermissionById } from '/@/apis/gct-apaas/ReportController';
/**空值显示规则 */
export const emptyValueLabel = {
  [emptyValueEnum.A]: '--',
  [emptyValueEnum.B]: '(空)',
  [emptyValueEnum.C]: 'null',
  [emptyValueEnum.E]: 'N/A',
  [emptyValueEnum.D]: ' ',
};

/**
 * 日期类型格式，
 */
export const type2formatMapping = {
  [DateTimeTypeFormattingEnum.YEAR]: DateTimeValueEnum.YEAR,
  [DateTimeTypeFormattingEnum.YEAR_QUARTER]: DateTimeValueEnum.YEAR_QUARTER,
  [DateTimeTypeFormattingEnum.YEAR_MONTH]: DateTimeValueEnum.YEAR_MONTH,
  [DateTimeTypeFormattingEnum.YEAR_MONTH_DAY]: DateTimeValueEnum.YEAR_MONTH_DAY,
  [DateTimeTypeFormattingEnum.QUARTER]: DateTimeValueEnum.QUARTER,
  [DateTimeTypeFormattingEnum.MONTH]: DateTimeValueEnum.MONTH,
  [DateTimeTypeFormattingEnum.DAY]: DateTimeValueEnum.DAY,
  [DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_MM]: DateTimeValueEnum.YEAR_MONTH_DAY_HH_MM,
  [DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_SS]: DateTimeValueEnum.YEAR_MONTH_DAY_HH_SS,
};

/**逻辑计算 */
export const runCalculationByName = (
  list: number[],
  method: string,
  field: string,
  _field_proto_map: object,
): number | string | undefined => {
  if (!list.length) return;
  const { mappingType, specificConfig = {}, type } = _field_proto_map[field] || {};
  const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type) ? mappingType : type;
  const digits = fieldType === FIELD_TYPE.DOUBLE ? 2 : specificConfig.digits || 0;
  const array = list.filter((i) => !!i || i === 0).map((i) => Number(i));
  if (method === SummaryCalculationMethod.AVG) {
    return mean(array).toFixed(digits);
  }
  if (method === SummaryCalculationMethod.COUNT) {
    return sum(array);
  }
  if (method === SummaryCalculationMethod.NO_REPEAT_COUNT) {
    return sum(array);
  }
  if (method === SummaryCalculationMethod.MAX) {
    return max(array).toFixed(digits);
  }
  if (method === SummaryCalculationMethod.MIN) {
    return min(array).toFixed(digits);
  }
  if (method === SummaryCalculationMethod.SUM) {
    return sum(array).toFixed(digits);
  }
};

/**根据id获取报表信息  权限处理 */
export const transformSchemaByData = async (
  id: string,
  apiConfig,
): Promise<ReportTable | undefined> => {
  const flag = await getReportUserPermissionById({ id }, apiConfig);
  const data = await getReportInfo({ id }, apiConfig);
  const { runtimeJson, deleted, name, publish } = data || {};
  if (runtimeJson) {
    const schema = JSON.parse(runtimeJson);
    schema.isDelete = !!deleted;
    schema.reportName = name;
    schema.isLimit = !publish || !flag;
    schema._field_proto_map = {};
    return schema;
  }
};
