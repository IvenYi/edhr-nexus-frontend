import { ref, reactive, watch, computed, toRef, type Ref, inject } from 'vue';
import { ASSIGNMENTSTRATEGY_ENUM, Dependency_ENUM } from '/@page-designer/enum';
import { watchDebounced } from '@vueuse/core';
import type { BaseCoreComponent } from '../types';
import { useExpression } from '@/components/Expression/hooks/useExpressionCalc';
import { useCurrentPageFormState } from './useRenderData';
import { cloneDeep } from 'lodash-es';
import { FIELD_TYPE } from '@gct/runtime';

const Expression = useExpression();
const identify = Expression.identify;
const calculate = Expression.calculate;
export function useDependency(widget: BaseCoreComponent.BasicSchema, props) {
  const { field, isFieldModel, fieldLink, subModelKey, newSpecificConfig } = widget.props;
  /**
   * 子表需要拷贝一下
   */
  const fieldWidget = ref(subModelKey ? cloneDeep(props.widget) : props.widget);

  // 监听外层widget变更的时候,合并props参数,物料消耗表会修改对应状态参数,需要响应式变更
  watch(
    () => props.widget.props,
    (newProps) => {
      Object.assign(fieldWidget.value.props, newProps);
    },
  );

  const { currentPageFormState } = useCurrentPageFormState();
  const targetFieldId = field ? (isFieldModel ? fieldLink : field) : '';
  const configDependency = widget.props.componentDependency?.configDependency || {};

  const readonly_expression = configDependency[Dependency_ENUM.READONLY]?.expression;
  const readonly_value = configDependency[Dependency_ENUM.READONLY]?.value;
  if (readonly_value && readonly_expression) {
    insetDep(
      {
        expression: readonly_expression,
        formState: currentPageFormState.value,
      },
      (res) => {
        fieldWidget.value.props.field_readonly = !!res;
      },
    );
  }
  const field_required = widget.props?.newSpecificConfig?.newRequired;
  const required_expression = configDependency[Dependency_ENUM.REQUIRED]?.expression;
  const required_value = configDependency[Dependency_ENUM.REQUIRED]?.value;
  if (!field_required && required_value && required_expression) {
    insetDep(
      {
        expression: required_expression,
        formState: currentPageFormState.value,
      },
      (res) => {
        fieldWidget.value.props.required = !!res;
      },
    );
  }
  if (field_required) {
    fieldWidget.value.props.required = true;
  }

  const field_disabled = widget.props.disabled;
  const disabled_expression = configDependency[Dependency_ENUM.DISABLED]?.expression;
  const disabled_value = configDependency[Dependency_ENUM.DISABLED]?.value;
  if (!field_disabled && disabled_value && disabled_expression) {
    insetDep(
      {
        expression: disabled_expression,
        formState: currentPageFormState.value,
      },
      (res) => {
        fieldWidget.value.props.disabled = !!res;
      },
    );
  }

  const assignment_expression = configDependency[Dependency_ENUM.ASSIGNMENT]?.expression;
  const strategy = configDependency[Dependency_ENUM.ASSIGNMENT]?.strategy;
  if (assignment_expression) {
    insetDep(
      {
        expression: assignment_expression,
        formState: currentPageFormState.value,
      },
      (res) => {
        // 对日期字段进行数据合规处理
        const formattedValue = formatDateCompliance(res, newSpecificConfig?.mappingType);
        props.formData[field] = formattedValue;
      },
    );
  }

  if (!props.formData._OPCT) {
    props.formData._OPCT = { _DICT: {} };
  }
  const formRowData = toRef(() => {
    if (isFieldModel) {
      return props.formData._OPCT;
    }
    return props.formData;
  });

  const value = computed({
    get() {
      if (targetFieldId) {
        return formRowData.value[targetFieldId];
      }
      return '';
    },
    set(val: any) {
      if (
        targetFieldId &&
        !!assignment_expression &&
        strategy === ASSIGNMENTSTRATEGY_ENUM.alwaysCover
      )
        return;
      formRowData.value[targetFieldId!] = val;
    },
  });
  function insetDep({ expression, formState }, callback) {
    if (!expression || expression === 'true') {
      callback(true);
      return;
    }

    const identifyArgs = identify(expression);
    /**收集依赖 函数显隐控制 关联组件字段收集 */
    const cacheFormFields = computed(() => {
      return identifyArgs.reduce((total, i) => {
        const value = i.startsWith('_.') ? props.formData[i.slice(2)] : formState[i];
        total[i] = value;
        return total;
      }, {});
    });
    /**
     * 监听收集的依赖
     */
    watchDebounced(
      cacheFormFields,
      () => {
        calculate(expression, cacheFormFields.value).then(callback);
      },
      {
        debounce: 200,
        immediate: true,
      },
    );
  }
  return { value, formRowData, targetFieldId, fieldWidget };
}

/**
 * 日期数据合规处理函数
 * - 日期字段：截断时间部分，仅保留日期 (例: 2021-05-06 → 2021-05-06, 2021-05-06 00:00:00 → 2021-05-06, 2021-05-06 5:21:12 → 2021-05-06)，格式不符返回空
 * - 日期时间字段：补充时间部分为00:00:00 (例: 2021-05-06 → 2021-05-06 00:00:00)，格式不符返回空
 * - 时间字段：截断日期部分，仅保留时间部分 (例: 2021-05-06 5:21:12 → 5:21:12)，格式不符返回空
 */
function formatDateCompliance(value: any, fieldTypeVal: FIELD_TYPE): any {
  if (!value) return value;
  const valueStr = String(value).trim();
  // 日期字段处理：仅保留日期部分，如果有时间部分必须是00:00:00
  if (fieldTypeVal === FIELD_TYPE.DATE) {
    const dateMatch = valueStr.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      return ''; // 格式不符合，返回空
    }
    return dateMatch[1]; // 直接截断时间部分
  }
  // 日期时间字段处理：确保包含时间部分
  if (fieldTypeVal === FIELD_TYPE.DATE_TIME) {
    // 检查是否为纯日期格式 YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(valueStr)) {
      return `${valueStr} 00:00:00`;
    }
    // 检查是否为日期时间格式 YYYY-MM-DD HH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}\s\d{1,2}:\d{2}:\d{2}$/.test(valueStr)) {
      return valueStr;
    }
    // 检查是否为日期时间格式 YYYY-MM-DD HH:mm
    if (/^\d{4}-\d{2}-\d{2}\s\d{1,2}:\d{2}$/.test(valueStr)) {
      return `${valueStr}:00`;
    }
    return ''; // 格式不符合，返回空
  }

  // 时间字段处理：仅保留时间部分
  if (fieldTypeVal === FIELD_TYPE.TIME) {
    // 匹配 H:mm:ss 或 HH:mm:ss 或 H:mm 或 HH:mm 的格式
    const timeMatch = valueStr.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
    if (timeMatch) {
      return timeMatch[1];
    }
    return ''; // 格式不符合，返回空
  }

  return value;
}
