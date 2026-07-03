import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export function validateLengthRange(rule, value, formData) {
  const { minValue, maxValue } = formData.specificConfig || {};
  if ((minValue || minValue === 0) && (maxValue || maxValue === 0) && minValue > maxValue) {
    return Promise.reject();
  } else return Promise.resolve();
}

// 校验默认值的长度
export function validateFieldDefaultForLength(rule, value, formData, maxObj?) {
  const minValue = formData.specificConfig.minValue;
  let maxValue = formData.specificConfig.maxValue;
  maxValue = maxValue ?? (maxObj ? maxObj.end : undefined);
  if (value && minValue && value.length < minValue) {
    return Promise.reject(`${t('sys.model.minLengthDefault')}${minValue}`);
  } else if (value && (maxValue || maxValue === 0) && value.length > maxValue) {
    return Promise.reject(`${t('sys.model.maxLengthDefault')}${maxValue}`);
  } else return Promise.resolve();
}

// 校验默认值的大小
export function validateFieldDefaultForValue(rule, value, formData, maxObj?) {
  const minValue = formData.specificConfig.minValue;
  let maxValue = formData.specificConfig.maxValue;
  maxValue = maxValue ?? (maxObj ? maxObj.end : undefined);
  if (value && minValue && value < minValue) {
    return Promise.reject(`${t('sys.model.minNumDefault')}${minValue}`);
  } else if (value && (maxValue || maxValue === 0) && value > maxValue) {
    return Promise.reject(`${t('sys.model.maxNumDefault')}${maxValue}`);
  } else return Promise.resolve();
}

// 必填校验
export function required(rule, value) {}
