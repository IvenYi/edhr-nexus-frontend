<template>
  <div>
    <a-select class="w-full" v-model:value="_value" size="small">
      <a-select-option v-for="item in FontSizeOptions" :value="item" :key="item">
        {{ item }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FontSizeOptions, DEFAULT_FONT_SIZE } from '/@online-form/views/designer/constants';

  const props = defineProps<{
    value: number;
  }>();

  const emit = defineEmits(['update:value']);

  const _value = computed({
    get() {
      return props.value || DEFAULT_FONT_SIZE;
    },
    set(value) {
      emit('update:value', value);
    },
  });
</script>

<style></style>
