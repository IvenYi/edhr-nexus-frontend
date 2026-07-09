<template>
  <color-picker :preset="presetColor" :color="value" @update:color="handleUpdateColor">
    <template #icon>
      <div
        class="color-picker-icon"
        :style="{
          backgroundColor: value,
        }"
      ></div>
    </template>
  </color-picker>
</template>

<script setup lang="ts" name="color-editor">
  import { presetColor } from '@gct/runtime';

  withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();

  const handleUpdateColor = (_e, color) => {
    emit('update:value', color);
  };
</script>

<style lang="less" scoped>
  .color-picker-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }
</style>
