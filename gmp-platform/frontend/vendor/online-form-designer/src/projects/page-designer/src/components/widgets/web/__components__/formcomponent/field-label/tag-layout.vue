<template>
  <span
    :class="[
      disabled ? 'tag-label-disabled' : null,
      !!labelLayout?.hasLabelWidth &&
      (labelLayout?.layout.label === 'left' || labelLayout?.layout == 'horizontal')
        ? labelLayout?.overLabelDisplay == 'ellipsis'
          ? 'label-ellipsis'
          : 'label-wrap'
        : '',
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
  interface Props {
    labelLayout?: any;
    disabled: boolean;
  }
  defineProps<Props>();
</script>
<style scoped lang="less">
  .tag-label-disabled {
    opacity: 0.5;
  }

  .label-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-wrap {
    word-break: break-all;
    white-space: wrap;
  }
</style>
