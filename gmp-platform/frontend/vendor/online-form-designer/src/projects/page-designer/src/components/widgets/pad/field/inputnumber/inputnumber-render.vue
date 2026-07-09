<template>
  <vantField
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :class="{
      'has-currency': bindCompStyleType === BindCmpStyleEnum.CMP_CURRENCY,
      'has-time': bindCompStyleType === BindCmpStyleEnum.CMP_TIME,
    }"
    clearable
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
    :validate-trigger="['onChange', 'onBlur']"
    v-bind="inputNumberAttr"
    :type="inputType"
    :currency="currency"
    @focus="onFocus"
    @update:model-value="onChange"
    @change="onValueChange"
    @blur="onBlur"
    @keypress.enter="onEnter"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
    <template #input v-if="!showReadonly && bindCompStyleType === BindCmpStyleEnum.CMP_TIME">
      <TimeInput @update="updateValue" :widget="widget" :modelValue="Number(modelValue)" />
    </template>
  </vantField>
</template>

<script name="gct-inputnumber" setup lang="ts">
  import { computed, reactive, toRef, nextTick, onBeforeMount } from 'vue';
  import { InputNumber } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { createNumKeyboardPopup } from '@mobile/components/numKeyboard';
  import { createTimePicker } from '@mobile/components/timePicker';
  import taglabel from '../../__components__/taglabel.vue';
  import { toNumber, isNil } from 'lodash-es';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import TimeInput from './component/timeInput.vue';
  import BigNumber from 'bignumber.js';
  import { IMobInputnumberComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { FieldSchema } from '/@/projects/page-designer/src/hooks/getFieldSchema';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: InputNumber;
      validateRange?: boolean;
      formData: any;
    }>(),
    {
      validateRange: true,
    },
  );
  const fieldConfig = {
    [FIELD_TYPE.INTEGER]: {
      max: 9999999999,
      type: 'digit',
    },
    [FIELD_TYPE.LONG]: {
      max: 999999999999999,
      type: 'digit',
    },
    [FIELD_TYPE.DECIMAL]: {
      max: 9999999,
      type: 'number',
    },
  };

  const fieldInfo = ref();
  // const { field } = reactive(props.widget.props);
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, onChange, onEnter, onBlur, onFocus, value } = useFormWidget(
    props,
    emit,
    (v) => toNumber(v),
  );

  const {
    fieldType,
    notAutoFix,
    separator,
    currency,
    bindCompStyleType,
    displayTimeType,
    modelKey,
    field,
  } = reactive(props.widget.props);
  const inputType = computed(() => fieldConfig[fieldType!].type);
  const precision = Number(props.widget.props.precision);
  const maxValue: any = toRef(() => props.widget.props.maxValue || fieldConfig[fieldType!].max);
  const minValue: any = toRef(() => props.widget.props.minValue);

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const inputNumberAttr = computed(() => {
    if (!notAutoFix) {
      return {
        min: props.widget.props.minValue,
        max: props.widget.props.maxValue || fieldConfig[fieldType!].max,
      };
    }
    return {};
  });

  const onClear = async () => {
    emit('update:modelValue', null);
    await nextTick();
    onChange();
    onBlur();
  };
  onBeforeMount(async () => {
    const config = await FieldSchema.getConfigByField(modelKey, field);
    fieldInfo.value = config;
  });
  const readyOnlyValue = computed(() => {
    if (
      !isNil(value?.value) &&
      value.value !== '' &&
      value.value !== undefined &&
      value.value !== null
    ) {
      let _value = new BigNumber(value.value).toFixed(precision, 1);
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
    } else {
      return '';
    }
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: props.widget.props.disabled,
      label: readyOnlyValue.value,
    };
  });

  const normalizeWithPrecision = (inputValue: unknown): string | null => {
    if (isNil(inputValue) || inputValue === '') {
      return null;
    }

    // 与 web 端保持一致：使用 BigNumber + ROUND_DOWN(1) 按 precision 截取小数位。
    if (precision || precision === 0) {
      return new BigNumber(inputValue as string | number).toFixed(precision, 1);
    }

    return String(inputValue);
  };

  const fieldValue = computed<any>({
    get() {
      return props.modelValue;
    },
    set(value: string[]) {
      const raw = Array.isArray(value) ? value.join('') : (value as unknown as string);
      const normalizedValue = normalizeWithPrecision(raw);

      // 空值不应转为 0，保持为 null
      if (isNil(normalizedValue) || normalizedValue === '') {
        emit('update:modelValue', null);
        return;
      }

      // 数值样式：确保以数值类型提交
      if (bindCompStyleType === BindCmpStyleEnum.CMP_NUMBER) {
        emit('update:modelValue', toNumber(normalizedValue));
        return;
      }

      emit('update:modelValue', normalizedValue);
    },
  });
  const onValueChange = () => {
    // 空值时直接提交 null，避免被转成 0
    if (isNil(fieldValue.value) || fieldValue.value === '') {
      emit('update:modelValue', null);
      return;
    }

    let currentValue = fieldValue.value;

    if (!notAutoFix && Number(currentValue) > maxValue.value) {
      currentValue = maxValue.value;
    }
    if (!notAutoFix && Number(currentValue) < minValue.value) {
      currentValue = minValue.value;
    }

    const normalizedValue = normalizeWithPrecision(currentValue);
    if (isNil(normalizedValue) || normalizedValue === '') {
      emit('update:modelValue', null);
      return;
    }

    // 数值样式：若存在 digits 配置，用 Number(toFixed) 保持为数值类型
    if (bindCompStyleType === BindCmpStyleEnum.CMP_NUMBER) {
      if (fieldInfo.value?.specificConfig?.digits !== undefined) {
        const digits = fieldInfo.value?.specificConfig?.digits;
        emit('update:modelValue', Number(Number(normalizedValue).toFixed(digits)));
      } else {
        emit('update:modelValue', toNumber(normalizedValue));
      }
      return;
    }

    emit(
      'update:modelValue',
      fieldInfo.value?.specificConfig?.digits
        ? Number(normalizedValue).toFixed(fieldInfo.value?.specificConfig?.digits)
        : normalizedValue,
    );
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

  const updateValue = (val) => {
    if (bindCompStyleType === BindCmpStyleEnum.CMP_TIME) {
      value.value = val;
    }
  };

  defineExpose<IMobInputnumberComponentExpose>({ getValue, setValue });
</script>
