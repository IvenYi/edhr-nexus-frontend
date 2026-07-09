<template>
  <a-input-number
    id="inputNumber"
    v-model:value="modelValue"
    :min="min"
    :max="max"
    :precision="precision"
    :size="size"
    :bordered="bordered"
    :placeholder="placeholder"
    :disabled="disabled"
  />
</template>
<script setup lang="ts">
  import { SizeType } from 'ant-design-vue/es/config-provider';
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      value?: string | number;
      min?: number;
      max?: number;
      precision?: number;
      size?: SizeType;
      bordered?: boolean;
      placeholder?: string;
      disabled?: boolean;
    }>(),
    {
      size: 'small',
      bordered: true,
    },
  );

  const emit = defineEmits(['update:value']);
  const modelValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val ? val.toString() : '');
    },
  });
</script>
<style lang="less" scoped></style>
