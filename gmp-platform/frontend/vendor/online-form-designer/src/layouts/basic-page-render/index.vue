<template>
  <div class="basic-page-render">
    <div v-if="$slots.header" class="basic-page-render__header">
      <slot name="header"></slot>
    </div>
    <div
      class="basic-page-render__body"
      :style="{
        '--bg-color': bgColor,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="basic-page-render">
  import { computed } from 'vue';

  const props = defineProps({
    // true false red #000000
    useBgColor: {
      type: [Boolean, String],
      default: true,
    },
  });

  const bgColor = computed(() => {
    if (props.useBgColor === true) {
      return '#ffffff';
    } else if (typeof props.useBgColor === 'string') {
      return props.useBgColor;
    } else {
      return 'transparent';
    }
  });
</script>
<style lang="less" scoped>
  .basic-page-render {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 0 16px 16px !important;
    background-color: var(--padding-color, transparent);

    &__header {
      flex: none;
      margin-bottom: 10px;
    }

    &__body {
      flex: 1;
      max-height: 100%;
      background-color: var(--bg-color, transparent);
      border-radius: 8px;
      overflow: hidden;
    }
  }
</style>
