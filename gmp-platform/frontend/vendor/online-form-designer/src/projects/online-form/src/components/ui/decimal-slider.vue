<template>
  <a-slider
    class="decimal-slider"
    v-model:value="value"
    :step="_step"
    :tipFormatter="tipFormatter"
    :max="toInteger(max)"
    :min="toInteger(min)"
  />
</template>

<script lang="ts" setup name="decimal-slider">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      modelValue?: number;
      /** 步长可以是小数 */
      step: number;
      /** 精度 */
      precision?: number;
      max?: number;
      min?: number;
    }>(),
    {
      modelValue: undefined,
      precision: 0,
      step: 1,
      max: 100,
      min: 0,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', modelValue: number): void;
  }>();

  const scale = computed(() => Math.pow(10, props.precision));

  /** 按步长换算 */
  function toInteger(num?: number) {
    return (num ?? 0) * scale.value;
  }

  function toDecimalStr(num?: number) {
    return ((num ?? 0) / scale.value).toFixed(props.precision);
  }

  function toDecimal(num?: number) {
    return Number(toDecimalStr(num));
  }

  const value = computed({
    get() {
      return toInteger(props.modelValue);
    },
    set(v) {
      emit('update:modelValue', toDecimal(v));
    },
  });

  const _step = computed(() => props.step * scale.value);

  const tipFormatter = (value) => {
    console.log('tipFormatter', value);
    return toDecimalStr(value);
  };
</script>

<style lang="scss" scoped>
  .decimal-slider {
    :deep(.ant-slider-track) {
      background-color: #026ac8 !important;
    }
    :deep(.ant-slider-handle) {
      border-color: #026ac8 !important;
    }
  }
</style>
