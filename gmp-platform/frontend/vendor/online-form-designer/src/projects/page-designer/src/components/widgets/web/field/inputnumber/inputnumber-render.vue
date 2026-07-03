<template>
  <FieldReadonly
    v-if="readonly"
    :label="readyOnlyValue"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <template v-else>
    <TimeInput
      v-if="bindCompStyleType === BindCmpStyleEnum.CMP_TIME"
      @update="updateValue"
      v-bind="inputNumberAttr"
      :disabled="disabled"
      :widget="widget"
      :style="style"
      :modelValue="modelValue"
    />
    <a-input-number
      v-else
      ref="inputNumberRef"
      v-model:value="value"
      id="inputNumber"
      style="width: 100%"
      :style="style"
      v-bind="inputNumberAttr"
      @change="onChange"
      @pressEnter="onEnter"
      @blur="onBlur"
      @focus="onFocus"
    />
  </template>
</template>
<script setup lang="ts" name="gct-inputnumber">
  import { computed, toRefs, ref, onMounted, toRef, reactive } from 'vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { InputNumber } from '/@page-designer/types/web';
  import type { InputNumberProps } from 'ant-design-vue';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import TimeInput from './component/timeInput.vue';
  import BigNumber from 'bignumber.js';
  import { FIELD_TYPE } from '@gct/runtime';
  import { IInputnumberComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const fieldConfig = {
    [FIELD_TYPE.INTEGER]: {
      max: 9999999999,
    },
    [FIELD_TYPE.LONG]: {
      max: 999999999999999,
    },
    [FIELD_TYPE.DECIMAL]: {
      max: 9999999,
    },
  };
  const props = defineProps<{ modelValue?: number; widget: InputNumber; formData: Object }>();
  const formData = ref(props.formData);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const { onChange, onEnter, onBlur, onFocus, getValue, setValue, setInputFocus, value } =
    useFormWidget(props, emit);
  const {
    notAutoFix,
    maxValue,
    minValue,
    getFocus,
    placeholder,
    separator,
    currency,
    readonly,
    disabled,
    bindCompStyleType,
    displayTimeType,
  } = toRefs(props.widget.props);
  const { fieldType, field, bindFieldLink, isFieldModel } = reactive(props.widget.props);
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  const precision = toRef(() => Number(props.widget.props.precision || 0));
  const inputNumberRef = ref();

  onMounted(() => {
    setInputFocus(inputNumberRef, getFocus.value);
  });

  const inputNumberAttr = computed(() => {
    const currencyAttr = { disabled: disabled?.value };

    // 处理小数不做四舍五入，改为截取。注意：此方案当小数精度过长时，则依旧会出现问题。
    if (precision.value || precision.value === 0) {
      Object.assign(currencyAttr, {
        parser: (value) => {
          return value ? new BigNumber(value).toFixed(precision.value, 1) : null;
        },
        precision: precision.value,
      });
    }

    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      Object.assign(currencyAttr, {
        prefix: currency?.value || undefined,
      });
      if (separator.value) {
        Object.assign(currencyAttr, {
          formatter: (value) => {
            const currentValue = parseFloat(value);
            if (!Number.isInteger(currentValue)) {
              const integerVal = value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
              const decimalVal = value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
              return `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
            }

            return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
          parser: (value) => {
            return value.replace(/\$\s?|(,*)/g, '');
          },
        });
      }
    }

    let attr: InputNumberProps = {
      stringMode: false,
      placeholder: placeholder?.value,
      ...currencyAttr,
    };
    if (!notAutoFix?.value) {
      attr = {
        max: maxValue?.value,
        min: minValue?.value,
        ...attr,
      };
    }
    attr.max = attr.max ?? fieldConfig[fieldType!].max;
    return attr;
  });
  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      textAlign: styleProp.contentFont?.align || 'left',
      textAlignLast: styleProp.contentFont?.align || 'left',
    };
  });
  const readyOnlyValue = computed(() => {
    if (value.value !== null && value.value !== undefined && value.value !== '') {
      // console.log(value.value);
      // 如果返回的是string类型，不需要前端处理，直接返回
      let _value = new BigNumber(value.value).toFixed(precision.value, 1);

      // if (displayCurrency.value) {
      if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
        if (separator.value) {
          const currentValue = parseFloat(_value);
          if (!Number.isInteger(currentValue)) {
            const integerVal = _value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
            const decimalVal = _value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
            _value = `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
          } else {
            _value = `${_value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        }
        if (currency?.value) {
          _value = `${currency.value}${_value}`;
        }
      }

      if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_TIME) {
        _value = handle2TimeValue(_value);
      }
      if (formData.value._DICT) {
        formData.value._DICT[fieldKey] = { [value.value]: _value };
      }

      return _value;
    }

    return '';
  });

  const handle2TimeValue = (_value) => {
    let days, hours, minutes, seconds;
    days = _value ? Math.floor(_value / 86400) : 0;
    hours =
      !displayTimeType.value?.includes('d') && days > 0
        ? days * 24 + Number(setTimeVal(_value, 'hours'))
        : setTimeVal(_value, 'hours');
    minutes =
      !displayTimeType.value?.includes('h') && hours > 0
        ? hours * 60 + Number(setTimeVal(_value, 'minutes'))
        : setTimeVal(_value, 'minutes');
    seconds =
      !displayTimeType.value?.includes('m') && minutes > 0
        ? minutes * 60 + Number(setTimeVal(_value, 'seconds'))
        : setTimeVal(_value, 'seconds');
    const day = displayTimeType.value?.includes('d') ? days + ' 天 ' : '';
    const hour = displayTimeType.value?.includes('h') ? hours + ' 时 ' : '';
    const minute = displayTimeType.value?.includes('m') ? minutes + ' 分 ' : '';
    const second = displayTimeType.value?.includes('s') ? seconds + ' 秒' : '';
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
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_TIME) {
      value.value = val;
      emit('saveTableRow');
    }
  };

  defineExpose<IInputnumberComponentExpose>({
    getValue,
    setValue,
    focus: () => setInputFocus(inputNumberRef, true),
  });
</script>
<style scoped lang="less"></style>
