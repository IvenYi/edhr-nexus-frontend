import { ref, computed, watch, toRaw } from 'vue';
import Validator from 'async-validator';
import { omit, isNil } from 'lodash-es';
import dayjs from 'dayjs';
import { FIELD_TYPE } from '@gct/runtime';
import { RangeValidateMode, RenderModeEnum, ComponentTypeEnum } from '../constant';
import { useWidgetStaticAttrs, useCalculateFormula } from './useRenderData';
import type { IPaper, ISubTable2DInfo, ICheckTable2DInfo, BaseCoreComponent } from '../types';
import { renderUtils } from '../interface';

const formRules = ref({});

// 抽离固定样式
const constantRequiredStyles = {
  '--required-border-color': 'rgb(255, 31, 31, 0.36)',
  '--required-border-hover-color': 'rgb(255, 31, 31, 0.86)',
  '--required-background-color': 'rgb(255, 31, 31, 0.04)',
};

export function useValidator(props) {
  const widget: BaseCoreComponent.BasicSchema = props.widget;

  const {
    showModelName,
    showFieldName,
    modelKey,
    fieldType,
    targetFieldId,
    isFieldModel,
    showRequired,
    showDisabled,
    showDisplayStatus,
    dataRelationShip,
  } = useWidgetStaticAttrs(widget);

  const sizeStyles = {
    '--size': `${widget.props.size ?? 12}px`,
    '--cmp-width': `${widget.props.cmpWidth ?? 0}px`,
    '--cmp-height': `${widget.props.cmpHeight ?? 0}px`,
  };

  const showFormItem = computed(() => {
    if (dataRelationShip?.renderModeType === RenderModeEnum.ViewMode) {
      return false;
    }
    // 动态表值如果是原始态那么不需要走校验
    if (widget.component === ComponentTypeEnum.DynValue) {
      return false;
    }
    return widget.formItem;
  });

  const rules = computed(() => {
    const RuleProps: any = [];
    if (!showFormItem.value) {
      return RuleProps;
    }
    if (
      !targetFieldId ||
      showDisabled.value ||
      ['readonly-text', 'readonly-component'].includes(showDisplayStatus.value)
    ) {
      return RuleProps;
    }

    const {
      subFieldKey,
      minlength,
      regex,
      regexHint,
      validateTrue,
      validateFalse,
      enableRangeValidate,
      maxValidateMode,
      minValidateMode,
      minValue,
      maxValue,
      minFormulaExpr,
      maxFormulaExpr,
      minDate,
      maxDate,
      minDateFormulaExpr,
      maxDateFormulaExpr,
      maxDateValidateMode,
      minDateValidateMode,
    } = widget.props;

    const validatorInfo = {
      showModelName,
      showModelKey: modelKey,
      showFieldName,
      subFieldKey,
      targetFieldId,
    };

    const buildError = (message: string) => JSON.stringify({ ...validatorInfo, message });

    const getCurrentFormData = (_rule, options) => {
      if (!_rule._subtableFieldId) return options?.formData;

      const subTableData = options?.formData?.[_rule._subtableFieldId];

      if (!isNil(_rule._realRowIndex) && isNil(_rule._childSubTableDataIndex)) {
        return subTableData?.[_rule._realRowIndex];
      }

      if (!isNil(_rule._realRowIndex) && !isNil(_rule._childSubTableDataIndex)) {
        return subTableData?.[_rule._realRowIndex]?.['_2DTABLE_']?.[_rule._childSubTableDataIndex];
      }

      return options?.formData;
    };

    const shouldSkipEnumValidation = (_rule, options) => {
      // 非枚举关联规则直接执行校验
      if (!_rule._belongFieldId || isNil(_rule._optionValue)) {
        return false;
      }

      const _formData_ = getCurrentFormData(_rule, options);

      const enumFieldValue = renderUtils.getValue(
        _formData_?.[_rule._belongFieldId],
        _rule._multiple,
      );

      // 检查枚举字段是否包含当前规则对应的选项值
      const shouldValidate = Array.isArray(enumFieldValue)
        ? enumFieldValue.includes(_rule._optionValue)
        : enumFieldValue === _rule._optionValue;

      // 未包含选项值时跳过校验
      return !shouldValidate;
    };

    const isEmptyValue = (value: any): boolean => {
      return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      );
    };

    const createValidationRule = (validator: Function, message: string) => ({
      required: true,
      validator: (rule: any, value: any, callback: Function, source: any, options: any) => {
        // 跳过枚举关联字段的校验
        if (shouldSkipEnumValidation(rule, options)) {
          return true;
        }
        // 执行实际校验逻辑
        return validator(rule, value, callback, source, options);
      },
      message,
    });

    if (showRequired.value) {
      RuleProps.push(
        createValidationRule(
          (_rule, value, callback, source, options) => {
            if (isEmptyValue(value)) return false;
            return true;
          },
          buildError($t('sys.edhr.fieldRequired')),
        ),
      );
    }

    if (minlength) {
      RuleProps.push(
        createValidationRule(
          (_rule, value, callback, source, options) => {
            if (isEmptyValue(value)) return true;
            return value.length >= minlength;
          },
          buildError($t('sys.edhr.fieldLengthNotLessThan', { len: minlength })),
        ),
      );
    }

    if (regex) {
      RuleProps.push(
        createValidationRule(
          (_rule, value, callback, source, options) => {
            if (isEmptyValue(value)) return true;
            return new RegExp(regex).test(value);
          },
          buildError(regexHint ?? $t('sys.edhr.fieldFormatError')),
        ),
      );
    }

    if (validateTrue) {
      RuleProps.push({
        required: true,
        validator: (_rule, value) => value === true,
        message: buildError($t('sys.edhr.fieldValueNeedTrue')),
      });
    }

    if (validateFalse) {
      RuleProps.push({
        required: true,
        validator: (_rule, value) => value === false,
        message: buildError($t('sys.edhr.fieldValueNeedFalse')),
      });
    }

    if (enableRangeValidate) {
      if (minValidateMode === RangeValidateMode.Fixed_Number) {
        RuleProps.push(
          createValidationRule(
            (_rule, value, callback, source, options) => {
              if (isEmptyValue(value)) return true; // 验证通过

              // 尝试将值转换为数字
              const numberValue = Number(value);

              // 检查是否小于最小值
              if (numberValue < minValue) {
                return false;
              }
              return true; // 验证通过
            },
            buildError($t('sys.edhr.fieldValueNotLessThan', { val: minValue })),
          ),
        );
      }

      if (minValidateMode === RangeValidateMode.Variable_Validate && minFormulaExpr) {
        RuleProps.push({
          required: true,
          validator: async (_rule, value, callback, source, options) => {
            // 跳过枚举关联字段的校验
            if (shouldSkipEnumValidation(_rule, options)) {
              return Promise.resolve();
            }

            const { calculateFormula } = useCalculateFormula();
            const currentFormData = getCurrentFormData(_rule, options);
            const formulaValue = await calculateFormula(
              minFormulaExpr,
              currentFormData,
              options?.formData,
            );
            const parsedMin = parseFloat(formulaValue);

            if (!isNaN(parsedMin)) {
              if (isEmptyValue(value)) {
                return Promise.resolve();
              }
              // 尝试将值转换为数字
              const numberValue = Number(value);
              if (numberValue < parsedMin) {
                return Promise.reject(
                  new Error(buildError($t('sys.edhr.fieldValueNotLessThan', { val: parsedMin }))),
                );
              }
            }
            return Promise.resolve();
          },
        });
      }

      if (maxValidateMode === RangeValidateMode.Fixed_Number) {
        RuleProps.push(
          createValidationRule(
            (_rule, value, callback, source, options) => {
              if (isEmptyValue(value)) return true; // 验证通过
              // 尝试将值转换为数字
              const numberValue = Number(value);
              // 检查是否小于最小值
              if (numberValue > maxValue) {
                return false;
              }
              return true; // 验证通过
            },
            buildError($t('sys.edhr.fieldValueNoMoreThan', { val: maxValue })),
          ),
        );
      }

      if (maxValidateMode === RangeValidateMode.Variable_Validate && maxFormulaExpr) {
        RuleProps.push({
          required: true,
          validator: async (_rule, value, callback, source, options) => {
            // 跳过枚举关联字段的校验
            if (shouldSkipEnumValidation(_rule, options)) {
              return Promise.resolve();
            }
            const { calculateFormula } = useCalculateFormula();
            const currentFormData = getCurrentFormData(_rule, options);
            const formulaValue = await calculateFormula(
              maxFormulaExpr,
              currentFormData,
              options?.formData,
            );
            const parsedMax = parseFloat(formulaValue);

            if (!isNaN(parsedMax)) {
              if (isEmptyValue(value)) {
                return Promise.resolve();
              }
              // 尝试将值转换为数字
              const numberValue = Number(value);
              if (numberValue > parsedMax) {
                return Promise.reject(
                  new Error(buildError($t('sys.edhr.fieldValueNoMoreThan', { val: parsedMax }))),
                );
              }
            }
            return Promise.resolve();
          },
        });
      }

      if (minDateValidateMode === RangeValidateMode.Fixed_Number && minDate) {
        RuleProps.push(
          createValidationRule(
            (_rule, value, callback, source, options) => {
              if (isEmptyValue(value)) return true; // 验证通过

              // 尝试将值转换为时间戳
              const inputTime = dayjs(value).unix();
              const minTimestamp = dayjs(minDate).unix();

              // 检查是否小于最小日期
              if (inputTime < minTimestamp) {
                return false;
              }
              return true; // 验证通过
            },
            buildError($t('sys.edhr.fieldValueNotLessThan', { val: minDate })),
          ),
        );
      }

      if (maxDateValidateMode === RangeValidateMode.Fixed_Number && maxDate) {
        RuleProps.push(
          createValidationRule(
            (_rule, value, callback, source, options) => {
              if (isEmptyValue(value)) return true; // 验证通过

              // 尝试将值转换为时间戳
              const inputTime = dayjs(value).unix();
              const maxTimestamp = dayjs(maxDate).unix();

              // 检查是否大于最小日期
              if (inputTime > maxTimestamp) {
                return false;
              }
              return true; // 验证通过
            },
            buildError($t('sys.edhr.fieldValueNoMoreThan', { val: maxDate })),
          ),
        );
      }

      if (minDateValidateMode === RangeValidateMode.Variable_Validate && minDateFormulaExpr) {
        RuleProps.push({
          required: true,
          validator: async (_rule, value, callback, source, options) => {
            // 跳过枚举关联字段的校验
            if (shouldSkipEnumValidation(_rule, options)) {
              return Promise.resolve();
            }
            const { calculateFormula } = useCalculateFormula();
            const currentFormData = getCurrentFormData(_rule, options);
            const formulaValue = await calculateFormula(
              minDateFormulaExpr,
              currentFormData,
              options?.formData,
            );

            if (!isNil(formulaValue) && !isNaN(formulaValue)) {
              if (isEmptyValue(value)) {
                return Promise.resolve();
              }

              const inputTime = dayjs(value).unix();
              const fmt = fieldType === FIELD_TYPE.DATE_TIME ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
              if (inputTime < formulaValue) {
                return Promise.reject(
                  new Error(
                    buildError(
                      $t('sys.edhr.fieldValueNotLessThan', {
                        val: dayjs.unix(formulaValue).format(fmt),
                      }),
                    ),
                  ),
                );
              }
            }
            return Promise.resolve();
          },
        });
      }

      if (maxDateValidateMode === RangeValidateMode.Variable_Validate && maxDateFormulaExpr) {
        RuleProps.push({
          required: true,
          validator: async (_rule, value, callback, source, options) => {
            // 跳过枚举关联字段的校验
            if (shouldSkipEnumValidation(_rule, options)) {
              return Promise.resolve();
            }
            const { calculateFormula } = useCalculateFormula();
            const currentFormData = getCurrentFormData(_rule, options);
            const formulaValue = await calculateFormula(
              maxDateFormulaExpr,
              currentFormData,
              options?.formData,
            );

            if (!isNil(formulaValue) && !isNaN(formulaValue)) {
              if (isEmptyValue(value)) {
                return Promise.resolve();
              }

              const inputTime = dayjs(value).unix();
              const fmt = fieldType === FIELD_TYPE.DATE_TIME ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
              if (inputTime > formulaValue) {
                return Promise.reject(
                  new Error(
                    buildError(
                      $t('sys.edhr.fieldValueNoMoreThan', {
                        val: dayjs.unix(formulaValue).format(fmt),
                      }),
                    ),
                  ),
                );
              }
            }
            return Promise.resolve();
          },
        });
      }
    }

    return RuleProps;
  });

  const getRules = (rules, options) =>
    rules.map((item) => {
      return {
        ...item,
        ...options,
      };
    });

  watch(
    () => rules.value,
    () => {
      if (targetFieldId && rules.value) {
        if (rules.value.length === 0) {
          delete formRules.value[targetFieldId];
        } else if (props.subtableFieldId) {
          if (!isNil(props.realRowIndex) && isNil(props.childSubTableDataIndex)) {
            formRules.value[`${props.subtableFieldId}_${props.realRowIndex}_${targetFieldId}`] =
              getRules(toRaw(rules.value), {
                _subtableFieldId: props.subtableFieldId,
                _realRowIndex: props.realRowIndex,
                _targetFieldId: targetFieldId,
                _belongFieldId: props.referenceInfo?.belongFieldId,
                _optionValue: props.referenceInfo?.optionValue,
                _multiple: props.referenceInfo?.multiple,
              });
          } else if (!isNil(props.realRowIndex) && !isNil(props.childSubTableDataIndex)) {
            formRules.value[
              `${props.subtableFieldId}_${props.realRowIndex}_${targetFieldId}_${props.childSubTableDataIndex}`
            ] = getRules(toRaw(rules.value), {
              _subtableFieldId: props.subtableFieldId,
              _realRowIndex: props.realRowIndex,
              _targetFieldId: targetFieldId,
              _childSubTableDataIndex: props.childSubTableDataIndex,
              _belongFieldId: props.referenceInfo?.belongFieldId,
              _optionValue: props.referenceInfo?.optionValue,
              _multiple: props.referenceInfo?.multiple,
            });
          }
        } else {
          formRules.value[targetFieldId] = getRules(toRaw(rules.value), {
            _targetFieldId: targetFieldId,
            _belongFieldId: props.referenceInfo?.belongFieldId,
            _optionValue: props.referenceInfo?.optionValue,
            _multiple: props.referenceInfo?.multiple,
          });
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );
  const widgetStyles = computed(() => {
    if (widget.component === ComponentTypeEnum.DynValue) return {};
    return { ...sizeStyles, ...(showRequired.value ? constantRequiredStyles : {}) };
  });
  return {
    widgetStyles,
    targetFieldId,
    isFieldModel,
  };
}

export const validate = (formData, paper: IPaper, showMsg = true, notifyCallback) => {
  if (!paper?.props) return;
  const subTable2DList = paper.props.subTable2DList ?? [];
  const checkTable2DList = paper.props.checkTable2DList ?? [];

  const list2D: Array<ISubTable2DInfo & ICheckTable2DInfo> = [].concat(
    subTable2DList,
    checkTable2DList,
  );

  const _formRules_ = toRaw(formRules.value);
  console.log('_formRules_', _formRules_);

  const filterKey = ['_DICT', '_OPCT', '__FOREIGN__', '_2DTABLE_'];
  const _formData_ = {};
  Object.keys(omit(formData, filterKey)).forEach((key) => {
    if (Array.isArray(formData[key])) {
      const info = list2D.find(
        (item) => (item.subTable2d || item.checkTable2d) && item.rowSubFieldKey === key,
      );

      formData[key]
        .filter((d) => !d.deleted_)
        .forEach((data, index) => {
          if (info && (info.subTable2d || info.checkTable2d)) {
            Object.keys(omit(data, filterKey)).forEach((field) => {
              // 过滤掉交叉部分
              if (!info.crossFieldKeys.includes(field)) {
                _formData_[`${key}_${index}_${field}`] = data[field];
              }
            });

            data['_2DTABLE_'].forEach((childData, jj) => {
              Object.keys(omit(childData, filterKey)).forEach((childField) => {
                _formData_[`${key}_${index}_${childField}_${jj}`] = childData[childField];
              });
            });
          } else {
            Object.keys(omit(data, filterKey)).forEach((field) => {
              _formData_[`${key}_${index}_${field}`] = data[field];
            });
          }
        });
    } else {
      _formData_[key] = formData[key];
    }
  });

  console.log('_formData_', _formData_);

  const validator = new Validator(_formRules_);

  return new Promise((resolve, reject) => {
    validator.validate(_formData_, { formData }, (errors, fields) => {
      console.log('errors', errors);
      const notify = (params: Record<string, any> = {}) => {
        if (typeof notifyCallback === 'function') {
          notifyCallback(params);
        }
      };

      if (errors?.length) {
        const { message } = errors[0];

        if (showMsg) {
          notify({ message, fields });
        }

        reject({
          isValid: false,
          callback: (opts = {}) => notify({ message, fields, ...opts }),
        });
      } else {
        notify({ clearValidator: true });
        resolve({ isValid: true });
      }
    });
  });
};

export function clearFormRules() {
  formRules.value = {};
}

export function deleteSubtableRow(subtableFieldId, realRowIndex) {
  const newFormRules = {};

  for (const key in formRules.value) {
    const regex = new RegExp(`^${subtableFieldId}_(\\d+)_`);
    const match = key.match(regex);

    if (match) {
      const rowIndex = parseInt(match[1]);

      if (rowIndex < realRowIndex) {
        // 删除前面的，保留原样
        newFormRules[key] = formRules.value[key];
      } else if (rowIndex > realRowIndex) {
        // 删除后面的，行号减1，重命名
        const newKey = key.replace(
          `${subtableFieldId}_${rowIndex}_`,
          `${subtableFieldId}_${rowIndex - 1}_`,
        );
        newFormRules[newKey] = formRules.value[key];
      }
      // rowIndex === realRowIndex 的就是要删除的，不处理
    } else {
      // 不属于这个subtableFieldId的，直接保留
      newFormRules[key] = formRules.value[key];
    }
  }

  formRules.value = newFormRules;
}
