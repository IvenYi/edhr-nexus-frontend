<template>
  <div
    class="w-full h-full flex"
    :class="[isInCell ? 'absolute top-0px left-0px in-cell' : '']"
    :style="{ ...widget.styles, '--w': widget.layout.width + 'px' }"
  >
    <div :style="compStyle"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { LineDirection } from '@gct/nocode-base';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  const props = defineProps<{
    widget: PaperWidget.Line;
    isInCell?: boolean;
  }>();

  const directionDToDeg = {
    [LineDirection.horizontal]: 0,
    [LineDirection.vertical]: 90,
  };

  const compStyle = computed(() => {
    const lineStyle = props.widget.lineStyle;

    const h = `${lineStyle.borderWidth}px`;

    const { rotate, direction } = props.widget;
    const deg = directionDToDeg[direction ?? LineDirection.horizontal];
    return {
      height: h,
      borderTop: `${h} ${lineStyle.borderStyle} ${lineStyle.borderColor}`,
      width: '100%',
      transform: `rotate(${deg + (rotate ?? 0)}deg)`,
    };
  });
</script>

<style lang="less" scoped>
  .in-cell {
    width: var(--w);
  }
</style>
