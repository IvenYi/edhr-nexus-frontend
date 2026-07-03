<template>
  <div class="edhr-desc-item">
    <span
      class="edhr-desc-item__name"
      :class="{
        'edhr-desc-item__name--colon': colon,
      }"
      >{{ name }}</span
    >
    <slot>
      <span class="ellipsis">{{ value }} </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      name: string;
      value?: any;
      colon?: boolean;
    }>(),
    {
      colon: true,
    },
  );
</script>

<style scoped lang="less">
  .edhr-desc-item {
    font-size: 12px;
    display: flex;
    &__name {
      color: var(--text-color-1);
      flex: none;
    }

    &__name--colon::after {
      content: '：';
    }
  }
</style>
