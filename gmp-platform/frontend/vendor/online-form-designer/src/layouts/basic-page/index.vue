<template>
  <div class="basic-page">
    <div v-if="$slots.header" class="basic-page__header">
      <slot name="header"></slot>
    </div>
    <div
      class="basic-page__body"
      :style="{
        '--bg-color': bgColor,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="basic-page">
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
  .basic-page {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 16px !important;
    padding-top: 0 !important;
    background-color: var(--padding-color, transparent);

    &__header {
      flex: none;
      margin-bottom: 10px;
    }

    &__body {
      flex: 1;
      max-height: 100%;
      background-color: var(--bg-color, transparent);
    }
  }

  .basic-page.pt-0 {
    padding-top: 0 !important;
  }
</style>
