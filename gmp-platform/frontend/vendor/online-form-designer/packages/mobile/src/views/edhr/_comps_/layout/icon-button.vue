<template>
  <div :class="['icon-button']">
    <gct-icon :value="value" :color="color" :background="background" :size="size" />
  </div>
</template>

<script lang="ts" setup name="icon-button">
  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    color: {
      type: String,
    },
    background: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 16,
    },
  });
</script>

<style lang="less" scoped>
  .icon-button {
    --icon-button-size: 36px;
    width: var(--icon-button-size);
    height: var(--icon-button-size);
    border-radius: 6px 6px 6px 6px;
    border: 1px solid #e0e3eb;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>
