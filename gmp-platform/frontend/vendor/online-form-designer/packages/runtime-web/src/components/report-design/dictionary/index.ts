import { SummaryCalculationMethod } from '../schema';
import { FIELD_TYPE } from '@gct/runtime';
import { DataSetReturnTypeEnum } from '/@/components/Expression';

/**
 * 计算方式字典
 */
export const calculationMethodDictionary = {
  tag: 'CalculationMethod',
  mode: 'static',
  items: [
    { label: '求和', value: SummaryCalculationMethod.SUM },
    { label: '计数', value: SummaryCalculationMethod.COUNT },
    { label: '去重计数', value: SummaryCalculationMethod.NO_REPEAT_COUNT },
    { label: '平均值', value: SummaryCalculationMethod.AVG },
    { label: '最大值', value: SummaryCalculationMethod.MAX },
    { label: '最小值', value: SummaryCalculationMethod.MIN },
    { label: '自定义', value: SummaryCalculationMethod.CUSTOM },
  ],
};

/**
 * 小计计算方式字典
 */
export const subtotalCalculationMethodDictionary = {
  tag: 'CalculationMethod',
  mode: 'static',
  items: [
    { label: '求和', value: SummaryCalculationMethod.SUM },
    { label: '计数', value: SummaryCalculationMethod.COUNT },
    { label: '去重计数', value: SummaryCalculationMethod.NO_REPEAT_COUNT },
    { label: '平均值', value: SummaryCalculationMethod.AVG },
    { label: '最大值', value: SummaryCalculationMethod.MAX },
    { label: '最小值', value: SummaryCalculationMethod.MIN },
  ],
};

/**
 * 根据字段类型获取可用的计算方式选项
 * @param fieldType 字段类型
 * @param mappingType 映射类型（用于公式字段）
 * @returns 可用的计算方式选项数组
 */
export function getCalculationMethodsByFieldType(fieldType: FIELD_TYPE, mappingType?: FIELD_TYPE) {
  // 数值类型字段：整数、长整数、小数、精度小数、汇总、公式（适用的整数、长整数、精度小数）
  const numericFieldTypes = [
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.AGG,
  ];

  // 数值类型字段
  if (
    numericFieldTypes.includes(fieldType) ||
    fieldType === FIELD_TYPE.EXPRESSION ||
    fieldType === FIELD_TYPE.FUNCTION
  ) {
    let bol: boolean = true;
    if (fieldType === FIELD_TYPE.EXPRESSION) {
      const supportedMappingTypes = [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DECIMAL];
      bol = !!(mappingType && supportedMappingTypes.includes(mappingType));
    }
    if (fieldType === FIELD_TYPE.FUNCTION) {
      bol = !!(mappingType === DataSetReturnTypeEnum.Double);
    }

    if (bol) {
      return [
        { label: '求和', value: SummaryCalculationMethod.SUM },
        { label: '计数', value: SummaryCalculationMethod.COUNT },
        { label: '去重计数', value: SummaryCalculationMethod.NO_REPEAT_COUNT },
        { label: '平均值', value: SummaryCalculationMethod.AVG },
        { label: '最大值', value: SummaryCalculationMethod.MAX },
        { label: '最小值', value: SummaryCalculationMethod.MIN },
        { label: '无', value: SummaryCalculationMethod.NONE },
      ];
    }
  }

  // 其余字段类型
  return [
    { label: '计数', value: SummaryCalculationMethod.COUNT },
    { label: '去重计数', value: SummaryCalculationMethod.NO_REPEAT_COUNT },
    { label: '无', value: SummaryCalculationMethod.NONE },
  ];
}
