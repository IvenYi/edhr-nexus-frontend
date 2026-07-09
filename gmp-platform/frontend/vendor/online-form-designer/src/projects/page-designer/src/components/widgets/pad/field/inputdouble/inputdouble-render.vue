<template>
  <vantField
    type="number"
    v-model="fieldValue"
    :props="widget.props"
    :style="widget.style"
    :class="{ 'has-currency': bindCompStyleType === BindCmpStyleEnum.CMP_CURRENCY }"
    clearable
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
    :currency="currency"
    @focus="onFocus"
    @update:model-value="onChange"
    @blur="onBlurchange"
    @keypress.enter="onEnter"
    :validate-trigger="['onChange', 'onBlur']"
    v-bind="inputNumberAttr"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script name="gct-inputdouble" setup lang="ts">
  import { toRef, computed, reactive, nextTick } from 'vue';
  import { InputDouble } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import taglabel from '../../__components__/taglabel.vue';
  import { has, toNumber, isNil } from 'lodash-es';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';

  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import { IMobInputdoubleComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ modelValue?: string; widget: InputDouble; formData: any }>();

  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, value, onChange, onEnter, onBlur, onFocus } = useFormWidget(
    props,
    emit,
    (v) => toNumber(v),
  );

  const { notAutoFix, readonly, fieldType, disabled, bindCompStyleType, separator, currency } =
    reactive(props.widget.props);
  const maxValue: any = toRef(() => props.widget.props.maxValue);
  const minValue: any = toRef(() => props.widget.props.minValue);

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const onClear = async () => {
    emit('update:modelValue', null);
    await nextTick();
    onChange();
    onBlur();
  };

  const fieldValue = computed<any>({
    get() {
      return props.modelValue;
    },
    set(value: string[]) {
      // 空值不应转为 0，保持为 null，避免触发不必要的校验
      if (isNil(value) || value === '') {
        emit('update:modelValue', null);
        return;
      }
      emit('update:modelValue', value);
    },
  });

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

  const inputNumberAttr = computed(() => {
    if (!notAutoFix) {
      return {
        min: props.widget.props.minValue,
        max: props.widget.props.maxValue,
      };
    }
    return {};
  });

  const readyOnlyValue = computed(() => {
    if (
      !isNil(value?.value) &&
      value.value !== '' &&
      value.value !== undefined &&
      value.value !== null
    ) {
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

  const onBlurchange = () => {
    // 空值时直接 blur，避免触发边界值校验
    if (isNil(fieldValue.value) || fieldValue.value === '') {
      onBlur();
      return;
    }

    if (!notAutoFix && Number(value) > maxValue.value) {
      emit('update:modelValue', maxValue.value);
    }
    if (!notAutoFix && Number(fieldValue.value) < minValue.value) {
      emit('update:modelValue', minValue.value);
    }

    onBlur();
  };

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
