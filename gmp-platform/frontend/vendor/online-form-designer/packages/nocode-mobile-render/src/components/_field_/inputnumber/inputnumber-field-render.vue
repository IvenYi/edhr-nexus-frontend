<template>
  <NocodeField
    :class="['field-double-input', { 'is-out-of-range': outOfRange }]"
    v-model="value"
    :label="showFieldName"
    :required="showRequired"
    :disabled="showDisabled || showReadonly"
    :placeholder="placeholder"
    @click="showPopup"
    @clearValue="onClear"
    :clearable="!enableStepCounter"
    readonly
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
    <template #input>
      <template v-if="enableStepCounter">
        <div class="step-controls">
          <van-button
            class="flex-1 step-btn"
            icon="minus"
            type="default"
            size="small"
            @click="onInternalStep(false)"
          />
          <div class="w-80px ks-row-center count">
            <span>{{ value }}</span>
          </div>
          <van-button
            class="flex-1 step-btn"
            icon="plus"
            type="default"
            size="small"
            @click="onInternalStep(true)"
          />
        </div>
      </template>
      <template v-else>
        <ValueWrapper :modelValue="valueLabel" :placeholder="placeholder">
          <span>{{ valueLabel }}</span>
        </ValueWrapper>
      </template>
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="online-form-inputnumber-field-render">
  import { reactive, ref, computed, watch } from 'vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import { isNil } from 'lodash-es';
  import BigNumber from 'bignumber.js';
  import { createNumKeyboardPopup } from '@mobile/components/numKeyboard';
  import { useNocodeFormWidget, type IInputNumber } from '@gct/nocode-base';
  import { FieldTypeIcon, NocodeField } from '../../_common_';
  import ValueWrapper from '../../_common_/nocode-field/value-wrapper.vue';
  import { useMobileAttrs } from '../../../hooks';
  import { useRangeValidate } from './hooks/useRangeValidate';

  const props = defineProps<{
    modelValue?: string | number;
    widget: IInputNumber;
    formData: any;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { value, onChange, onBlur, onPressEnter } = useNocodeFormWidget(props, emit);

  const {
    fieldType,
    showFieldName,
    showRequired,
    showDisabled,
    showReadonly,
    placeholder,
    realPrecision,
  } = useMobileAttrs(props.widget);

  const { openNumKeyPopup } = createNumKeyboardPopup({});

  const { outOfRange } = useRangeValidate(props, value);

  const { enableStepCounter, stepCounter = 1, newSpecificConfig } = reactive(props.widget.props);

  const { newRulesForRounding } = reactive(newSpecificConfig);

  const isInteger = computed(() => {
    return [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG].includes(props.widget.props.fieldType as any);
  });

  const valueLabel = ref();

  watch(
    value,
    (v) => {
      if (!isNil(v) && v !== '') {
        valueLabel.value = new BigNumber(v).toFixed(realPrecision, newRulesForRounding || 1);
      } else {
        valueLabel.value = '';
      }
    },
    {
      immediate: true,
    },
  );

  const onClear = () => {
    emit('update:modelValue', null);
    onChange();
  };

  const onInternalStep = (up: boolean) => {
    console.log('inputValue.value', value.value);
    const newValue = Number(value.value || 0) + (up ? stepCounter : -stepCounter);

    value.value = newValue;
    onChange();
  };

  function showPopup(e) {
    if (showReadonly.value || showDisabled.value || enableStepCounter) return;
    const res: any = {};

    openNumKeyPopup({
      val: value.value,
      extra: isInteger.value ? '' : '.',
      minmax: res,
      precision: realPrecision,
      callback(a: any) {
        // 解决如果没有任何改变就关闭键盘 会出现12.320 => 12.32
        if (value.value === a) {
          return;
        }
        valueLabel.value = a;
        onChange();
      },
      onBlur(e) {
        value.value = e;
        onBlur();
      },
      onEnter: onPressEnter,
    });
  }
</script>
<style scoped lang="less">
  .step-controls {
    display: flex;
    align-items: center;

    .count {
      border: var(--van-button-border-width) solid var(--van-button-default-border-color);
      height: 32px;
      display: inline-flex;
      align-items: center;
      border-radius: var(--van-button-radius);
    }
  }
</style>
