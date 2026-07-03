<template>
  <vantField
    type="number"
    v-model="value"
    :props="widget.props"
    :style="widget.style"
    readonly
    @click="openView"
    clearable
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
    <template #input v-else-if="value"> {{ value }} </template>
  </vantField>
</template>

<script name="gct-inputdouble" setup lang="ts">
  import { ref, computed, reactive } from 'vue';
  import { InputDouble } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { createNumKeyboardPopup } from '@mobile/components/numKeyboard';
  import taglabel from '../../__components__/taglabel.vue';
  import { has, toNumber, isNil } from 'lodash-es';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';

  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import { IMobInputdoubleComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  // const show = ref(false);
  const props = defineProps<{ modelValue?: string; widget: InputDouble; formData: any }>();
  // const { field } = reactive(props.widget.props);
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, value, onChange, onEnter, onBlur, onFocus } = useFormWidget(
    props,
    emit,
  );

  const {
    notAutoFix,
    readonly,
    fieldType,
    disabled,
    bindCompStyleType,
    separator,
    currency,
    minValue,
    maxValue,
  } = reactive(props.widget.props);

  const { openNumKeyPopup } = createNumKeyboardPopup({});

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  function openView() {
    const res = {};
    if (!notAutoFix) {
      if (maxValue !== null && maxValue !== undefined) {
        Object.assign(res, {
          maxValue,
        });
      }
      if (minValue !== null && minValue !== undefined) {
        Object.assign(res, {
          minValue,
        });
      }
    }
    openNumKeyPopup({
      val: value.value,
      extra: '.',
      minmax: res,
      callback(a: any) {
        if (has(res, 'maxValue') && parseFloat(a) > maxValue) {
          value.value = maxValue;
        } else if (has(res, 'minValue') && parseFloat(a) < minValue) {
          value.value = minValue;
        } else {
          value.value = a;
        }
        onChange(value.value);
      },
      onBlur,
      onEnter,
      onFocus,
    });
  }

  const onClear = () => {
    emit('update:modelValue', null);
  };

  const separatorValue = (inputValue) => {
    const currentValue = parseFloat(inputValue);
    if (!Number.isInteger(currentValue)) {
      const integerVal = inputValue.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
      const decimalVal = inputValue.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
      return `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
    } else {
      return `${inputValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  const readyOnlyValue = computed(() => {
    if (!isNil(value?.value) && value.value !== '') {
      let _value = value.value + '';

      if (bindCompStyleType === BindCmpStyleEnum.CMP_CURRENCY) {
        if (separator) {
          _value = separatorValue(_value);
        }
        if (currency) {
          _value = `${currency}${_value}`;
        }
      }

      return _value;
    }

    return '';
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: readyOnlyValue.value,
    };
  });

  defineExpose<IMobInputdoubleComponentExpose>({ getValue, setValue });
</script>

<style lang="less" scoped></style>
