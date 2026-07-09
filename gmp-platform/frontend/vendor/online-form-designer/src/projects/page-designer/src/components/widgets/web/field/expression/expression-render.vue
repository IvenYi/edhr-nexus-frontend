<template>
  <component v-if="isBool" :is="cmp[bindCompStyleType ?? '']" v-bind="separatorAttr" />
  <FieldReadonly v-else v-bind="separatorAttr" />
</template>

<script name="gct-expression" setup lang="ts">
  import { computed, toRef, reactive, onBeforeMount, toRaw, watch, ref } from 'vue';
  import { Switch as ASwitch } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { Expression } from '/@page-designer/types/web';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  // import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';
  import BigNumber from 'bignumber.js';
  import { IExpressionComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { useFormulaByExpress } from './formula';
  // import { ReturnTypeEnum } from '/@/components/Expression/types';
  // import { postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  // import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
  // import { message } from 'ant-design-vue';
  // import { useI18n } from '/@/hooks/web/useI18n';

  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: ASwitch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps<{ modelValue?: string; widget: Expression; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);

  const {
    field,
    returnType,
    bindCompStyleType,
    fieldType,
    separator,
    currency,
    modelKey,
    readonly,
    displayTimeType,
    ruleConfig,
    isRealCompute,
    expType,
  } = reactive(props.widget.props);
  const isBool = returnType === 'boolean';
  const precision = toRef(() => Number(props.widget.props.precision || 0));
  const { getValue, setValue, value } = useFormWidget(props, emit);
  // const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const formulaLabel = ref();
  // 是否为数据连接模式
  const isLinkageMode = isRealCompute && expType && ruleConfig;
  onBeforeMount(() => {
    // getAsyncOptions({ fieldKey: field, modelKey });
    if (isRealCompute) {
      useFormulaByExpress({ isLinkageMode, ruleConfig, modelKey, field, formulaLabel }, props);
    }
  });

  const options = computed(() => {
    return [
      {
        label: props.widget.props?.truelabel,
        value: true,
      },
      {
        label: props.widget.props?.falselabel,
        value: false,
      },
    ];
  });

  const getBoolValue = (val) => {
    if (val === 'true' || val === 'false') {
      return JSON.parse(val);
    }
    if (val === undefined || val === null || isNaN(parseInt(val))) {
      return Boolean(val);
    }

    return Boolean(parseInt(val));
  };

  const getReadyOnlyValue = () => {
    if (isLinkageMode) {
      return formulaLabel.value || '';
    }
    if (['text', 'long_text'].includes(returnType)) {
      return value.value || '';
    }

    if (isBool) {
      return getBoolValue(value.value);
    }

    if (value.value !== null && value.value !== undefined && value.value !== '') {
      let _value = new BigNumber(value.value).toFixed(precision.value, 1);

      if (bindCompStyleType === BindCmpStyleEnum.CMP_CURRENCY) {
        if (separator) {
          const currentValue = parseFloat(_value);
          if (!Number.isInteger(currentValue)) {
            const integerVal = _value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
            const decimalVal = _value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
            _value = `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
          } else {
            _value = `${_value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        }
        if (currency) {
          _value = `${currency}${_value}`;
        }
      }

      if (bindCompStyleType === BindCmpStyleEnum.CMP_TIME) {
        _value = handle2TimeValue(_value);
      }

      return _value;
    }

    return '';
  };

  const handle2TimeValue = (_value) => {
    let days, hours, minutes, seconds;
    days = _value ? Math.floor(_value / 86400) : 0;
    hours =
      !displayTimeType?.includes('d') && days > 0
        ? days * 24 + Number(setTimeVal(_value, 'hours'))
        : setTimeVal(_value, 'hours');
    minutes =
      !displayTimeType?.includes('h') && hours > 0
        ? hours * 60 + Number(setTimeVal(_value, 'minutes'))
        : setTimeVal(_value, 'minutes');
    seconds =
      !displayTimeType?.includes('m') && minutes > 0
        ? minutes * 60 + Number(setTimeVal(_value, 'seconds'))
        : setTimeVal(_value, 'seconds');
    const day = displayTimeType?.includes('d') ? days + ' 天 ' : '';
    const hour = displayTimeType?.includes('h') ? hours + ' 时 ' : '';
    const minute = displayTimeType?.includes('m') ? minutes + ' 分 ' : '';
    const second = displayTimeType?.includes('s') ? seconds + ' 秒' : '';
    return `${day}${hour}${minute}${second}`;
  };

  const setTimeVal = (_value, type) => {
    let val = 0;
    const str1 = _value % 86400;
    const str2 = _value % 3600;
    switch (type) {
      case 'hours':
        val = Math.floor(str1 / 3600);
        break;
      case 'minutes':
        val = Math.floor(str2 / 60);
        break;
      case 'seconds':
        val = Math.floor(str2 % 60);
        break;
    }
    return _value ? (val < 10 ? '0' + val : val) : 0;
  };

  const separatorAttr = computed(() => {
    if (isBool) {
      const res = {};
      if (bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN) {
        Object.assign(res, {
          class: 'field-boolean--readyonly wauto',
        });
      }

      return {
        ...res,
        readonly: readonly,
        disabled: false,
        fieldType: returnType,
        tagStyle: props.widget.style,
        options: options.value,
        checked: true,
        checked: getReadyOnlyValue(),
        value: getReadyOnlyValue(),
      };
    }

    return {
      tagWidgetStyle: props.widget.style,
      type: returnType,
      isDesign: false,
      label: getReadyOnlyValue(),
    };
  });

  defineExpose<IExpressionComponentExpose>({ getValue, setValue });
</script>

<style scoped lang="less">
  .ant-switch {
    min-width: 32px;
    height: 20px;
    line-height: 20px;

    &:not(.ant-switch-disabled).field-boolean--readyonly {
      opacity: 0.5;
      pointer-events: none;
    }

    :deep(.ant-switch-handle) {
      top: 4px;
      left: 4px;
      width: 12px;
      height: 12px;
    }
  }

  .ant-switch-checked {
    :deep(.ant-switch-handle) {
      top: 3px;
      left: calc(100% - 16px);
      width: 14px;
      height: 14px;
    }
  }
</style>
