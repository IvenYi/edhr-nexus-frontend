<template>
  <div
    class="absolute w-full h-full flex"
    :class="[isInCell ? 'top-0px left-0px in-cell' : '']"
    :style="{ ...widget.styles, ...wrapperStyle, '--w': widget.layout.width + 'px' }"
  >
    <div :style="compStyle"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { pick } from 'lodash-es';
  import { LineDirection } from '@gct/nocode-base';

  const props = defineProps<{
    widget: any;
    isInCell?: boolean;
  }>();

  const directionDToDeg = {
    [LineDirection.horizontal]: 0,
    [LineDirection.vertical]: 90,
  };

  const wrapperStyle = computed(() => {
    if (props.isInCell) return {};
    const obj = pick(props.widget.layout, ['width', 'height']);
    for (const [key, value] of Object.entries(props.widget.layout)) {
      obj[key] = `${value}px`;
    }
    return obj;
  });

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
