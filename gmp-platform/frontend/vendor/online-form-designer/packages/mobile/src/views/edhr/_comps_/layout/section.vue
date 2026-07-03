<template>
  <div class="layout-section bg-white rounded-12px overflow-hidden flex flex-col">
    <div v-if="header" class="layout-section__header flex-none pl-16px pr-16px">
      <div class="flex justify-between items-center h-54px">
        <div class="layout-section__title">{{ title }}</div>
        <slot name="extra"></slot>
      </div>
    </div>
    <div class="overflow-hidden flex-1">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      header?: boolean;
      title?: string;
    }>(),
    {
      header: true,
    },
  );
</script>
<style scoped lang="less">
  .layout-section {
    &__header {
      & > div {
        border-bottom: 1px solid var(--border-color);
      }
    }
    &__title {
      color: var(--text-color);
      font-weight: bold;
      font-size: 16px;
    }
  }
</style>
