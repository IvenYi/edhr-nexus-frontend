<template>
  <FieldReadonly
    v-if="readonly"
    :label="readyOnlyValue"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-input-number
    v-else
    ref="doubleInputRef"
    v-model:value="value"
    id="inputNumber"
    style="width: 100%"
    v-bind="inputNumberAttr"
    @change="onChange"
    @pressEnter="onEnter"
    @blur="onBlur"
    @focus="onFocus"
    :style="style"
  />
</template>

<script setup lang="ts" name="gct-inputdouble-render">
  import { computed, toRefs, ref, onMounted, reactive } from 'vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { InputDouble } from '/@page-designer/types/web';
  import type { InputNumberProps } from 'ant-design-vue';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import BigNumber from 'bignumber.js';
  import { IInputdoubleComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = defineProps<{ modelValue?: number; widget: InputDouble; formData: Object }>();
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
    bindCompStyleType,
  } = toRefs(props.widget.props);
  const { fieldType, field, bindFieldLink, isFieldModel } = reactive(props.widget.props);
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  const doubleInputRef = ref();
  const formData = ref(props.formData);
  onMounted(() => {
    setInputFocus(doubleInputRef, getFocus.value);
  });
  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      textAlign: styleProp.contentFont?.align || 'left',
      textAlignLast: styleProp.contentFont?.align || 'left',
    };
  });
  const separatorValue = (inputValue) => {
    let valueStr = (inputValue ?? '').toString();
    const currentValue = parseFloat(valueStr);

    // 点开头处理为 0.
    if (valueStr.indexOf('.') === 0) {
      valueStr = `0${valueStr}`;
    }

    // 判断是否是整数
    if (!Number.isInteger(currentValue)) {
      const integerVal = valueStr.replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
      const decimalVal = valueStr.replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
      return `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
    }

    // 判断是否是【整数+.】开头
    const reg = new RegExp(`^${currentValue}(\\.)`, 'g');

    if (reg.test(valueStr)) {
      // 从字符串中截取出【整数+.】
      const firstVal = valueStr.replace(new RegExp(`^(${currentValue}(\\.))(.*)`), '$1');
      // 判断是否相等
      if (firstVal === `${currentValue}.`) {
        const integerVal = valueStr.replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
        const decimalVal = valueStr.replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
        return `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
      }
    }

    return `${valueStr}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const inputNumberAttr = computed(() => {
    const currencyAttr = {};
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      Object.assign(currencyAttr, {
        prefix: currency.value || undefined,
      });
      if (separator.value) {
        Object.assign(currencyAttr, {
          formatter: (val) => {
            return separatorValue(value.value);
          },
          parser: (value) => {
            return value.replace(/\$\s?|(,*)/g, '');
          },
        });
      }
    } else {
      Object.assign(currencyAttr, {
        parser: (value) => {
          return value ? new BigNumber(value).toFixed(15, 1) : null;
        },
      });
    }

    let attr: InputNumberProps = {
      // autofocus: getFocus.value,
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
    attr.max = attr.max ?? 999999999999999;
    return attr;
  });

  const readyOnlyValue = computed(() => {
    if (value.value !== null && value.value !== undefined && value.value !== '') {
      let _value = value.value + '';

      // if (displayCurrency.value) {
      if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
        if (separator.value) {
          _value = separatorValue(_value);
        }
        if (currency.value) {
          _value = `${currency.value}${_value}`;
        }
      }
      if (formData.value._DICT) {
        formData.value._DICT[fieldKey] = { [value.value]: _value };
      }
      return _value;
    }

    return '';
  });
  defineExpose<IInputdoubleComponentExpose>({
    getValue,
    setValue,
    focus: () => setInputFocus(doubleInputRef, true),
  });
</script>
<style scoped lang="less"></style>
