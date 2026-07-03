<template>
  <div
    class="panel-form-item"
    :class="{
      inline,
    }"
  >
    <div class="panel-form-item__label">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="panel-form-item__content">
      <slot> </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      label?: string;
      inline?: boolean;
    }>(),
    {
      inline: true,
    },
  );
</script>

<style lang="less" scoped>
  .panel-form-item {
  }
</style>
