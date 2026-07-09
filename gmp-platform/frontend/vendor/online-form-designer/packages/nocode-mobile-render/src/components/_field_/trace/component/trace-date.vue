<template>
  <FieldDatePicker
    v-model="currentValue"
    :format="enableCustomFormat ? customFormat : format"
    :dateType="dateType"
    is-select
    v-bind="$attrs"
  >
    <template #label-left>
      <slot name="label-left"></slot>
    </template>
  </FieldDatePicker>
</template>

<script lang="ts" setup name="user-select">
  import { computed, reactive } from 'vue';
  import { FieldDatePicker } from '../../../_common_';
  import type { ITrace } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: ITrace;
      formData: Object;
    }>(),
    {},
  );

  const emit = defineEmits(['update:modelValue', 'change']);

  const currentValue = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
      emit('change');
    },
  });

  const { dateType, format, enableCustomFormat, customFormat } = reactive(props.widget.props);
</script>

<style lang="less" scoped>
  .user-select {
  }
</style>
