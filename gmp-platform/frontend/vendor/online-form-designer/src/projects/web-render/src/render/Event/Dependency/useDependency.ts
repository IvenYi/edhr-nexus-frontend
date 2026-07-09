import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { ref, reactive, watch, computed, toRef, Ref, inject } from 'vue';
import { ASSIGNMENTSTRATEGY_ENUM, Dependency_ENUM } from '/@page-designer/enum';
import { insetDep } from './controller';
import { watchDebounced } from '@vueuse/core';
import { getRefInfoId } from '/@page-designer/components/widgets/hooks/hooks';
import { ProcessAppRovedData } from '../utils/processRovedInfo';

export function useDependency(widget: LowCodeWidget.BasicSchema, formState = {}, isRow = false) {
  const {
    readonly,
    field,
    isFieldModel,
    bindFieldLink,
    refOriginField,
    refOriginModelKey,
    refOriginFieldType,
  } = widget.props;
  const configDependency = widget.props.componentDependency?.configDependency || {};
  const formReadonly = <Ref<boolean> | undefined>inject('formReadonly', undefined);
  const useProcessFieldEvent = inject<ProcessAppRovedData | undefined>(
    'useProcessFieldEvent',
    undefined,
  );
  useProcessFieldEvent && useProcessFieldEvent.useFieldWidget(widget);
  if (!useProcessFieldEvent && widget.formItem && formReadonly?.value !== undefined) {
    widget.props.readonly = formReadonly?.value || widget.props.readonly;
  }

  if (!useProcessFieldEvent && !formReadonly?.value) {
    const readonly_expression = configDependency[Dependency_ENUM.READONLY]?.expression;
    const readonly_field_value = configDependency[Dependency_ENUM.READONLY]?.fieldValue;
    const readonly_value = configDependency[Dependency_ENUM.READONLY]?.value;
    if (!readonly_field_value && readonly_value && readonly_expression) {
      insetDep({ expression: readonly_expression, rowData: isRow ? formState : null }, (res) => {
        widget.props.readonly = !!res;
      });
    }

    const required_expression = configDependency[Dependency_ENUM.REQUIRED]?.expression;
    const required_value = configDependency[Dependency_ENUM.REQUIRED]?.value;
    const required_field_value = configDependency[Dependency_ENUM.REQUIRED]?.fieldValue;
    if (!required_field_value && required_value && required_expression) {
      insetDep({ expression: required_expression, rowData: isRow ? formState : null }, (res) => {
        widget.props.required = !!res;
        if (res) {
          widget.props.readonly = false;
        } else {
          widget.props.readonly = readonly;
        }
      });
    }
    const disabled_expression = configDependency[Dependency_ENUM.DISABLED]?.expression;
    const disabled_value = configDependency[Dependency_ENUM.DISABLED]?.value;
    if (disabled_value && disabled_expression) {
      insetDep({ expression: disabled_expression, rowData: isRow ? formState : null }, (res) => {
        widget.props.disabled = !!res;
        if (res) {
          widget.props.readonly = false;
        } else {
          widget.props.readonly = readonly;
        }
      });
    }
  }

  const assignment_expression = configDependency[Dependency_ENUM.ASSIGNMENT]?.expression;
  const strategy = configDependency[Dependency_ENUM.ASSIGNMENT]?.strategy;
  if (assignment_expression && !readonly) {
    // 添加immediate参数，避免从编辑态变成只读态初始化时重复执行赋值表达式
    // immediate: !formState['_ASSIGNMENT_' + field]
    insetDep({ expression: assignment_expression, rowData: isRow ? formState : null }, (res) => {
      formState[field] = res;
      // formState['_ASSIGNMENT_' + field] = undefined;
    });
  }
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  if (!formState._OPCT) {
    formState._OPCT = { _DICT: {} };
  }
  const formRowData = computed(() => {
    if (isFieldModel) {
      return formState._OPCT;
    }
    return formState;
  });

  const value = computed({
    get() {
      if (fieldKey) {
        return formRowData.value[fieldKey];
      }
      return '';
    },
    set(val: any) {
      if (!!assignment_expression && strategy === ASSIGNMENTSTRATEGY_ENUM.alwaysCover) {
      } else {
        formRowData.value[fieldKey] = val;
        // 对于组件依赖为赋值的字段且设置了‘不覆盖已修改’，设置一个标记，防止表格初始化时触发赋值表达式
        // if(!!assignment_expression){
        //    formRowData.value['_ASSIGNMENT_' + fieldKey] = true;
        // }
      }
    },
  });

  if (isFieldModel && refOriginField) {
    /**
     * 多级字段显示逻辑
     * 监听源字段
     * */
    const originField = toRef(() => {
      return formState[bindFieldLink[0]];
    });
    const foreignFields = bindFieldLink.length > 2 ? [bindFieldLink[1] + '.*'] : undefined;
    watchDebounced(
      originField,
      async () => {
        try {
          const data = await getRefInfoId({
            ids: originField.value,
            refOriginField: bindFieldLink[0],
            refOriginFieldType: refOriginFieldType,
            model: refOriginModelKey,
            foreignFields,
          });
          formRowData.value[fieldKey] = data._OPCT[fieldKey];
          if (!formRowData.value._DICT) {
            formRowData.value._DICT = {};
          }
          formRowData.value._DICT[fieldKey] = data._OPCT._DICT[fieldKey];
        } catch (error) {
          for (const key in formRowData.value) {
            if (key.startsWith(fieldKey)) {
              formRowData.value[key] = undefined;
            }
          }
        }
      },
      { debounce: 100, immediate: true },
    );
  }
  return { value, formRowData, fieldKey };
}

export function useDependencyByRequired(widget: LowCodeWidget.BasicSchema) {
  const { readonly } = widget.props;
  const configDependency = widget.props.componentDependency?.configDependency || {};

  const required_expression = configDependency[Dependency_ENUM.REQUIRED]?.expression;
  const required_value = configDependency[Dependency_ENUM.REQUIRED]?.value;
  const required_field_value = configDependency[Dependency_ENUM.REQUIRED]?.fieldValue;
  if (!required_field_value && required_value && required_expression) {
    insetDep({ expression: required_expression }, (res) => {
      widget.props.required = !!res;
      if (res) {
        widget.props.readonly = false;
      } else {
        widget.props.readonly = readonly;
      }
    });
  }
}
