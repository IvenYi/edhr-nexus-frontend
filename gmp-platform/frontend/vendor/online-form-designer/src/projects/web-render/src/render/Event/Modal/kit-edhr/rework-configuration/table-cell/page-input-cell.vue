<template>
  <a-input-number
    class="w100%"
    :precision="0"
    min="1"
    v-model:value="fieldValue"
    :disabled="disabled || isPageNoDisabled"
    @change="(val) => emit('change', val)"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: number;
    disabled: boolean;
    isPageNoDisabled: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
    (e: 'change', value: number | null): void;
  }>();

  const fieldValue = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });
</script>
