<template>
  <div class="data-group__copy" :style="style">
    <div
      class="data-group__index"
      :class="{
        'data-group__index--row': render === 'row',
      }"
      >{{ dataGroupIndex }}</div
    >
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      dataGroupIndex?: number;
      cellRef: Record<string, string>;
      range: {
        t: number;
        b: number;
        l: number;
        r: number;
      };
      render?: 'col' | 'row';
    }>(),
    {
      render: 'col',
    },
  );

  const { rowHeightStage: rs, colWidthStage: ws } = useSpreadSheet();

  const colorStyle = {
    '--hover-color': '#7030cb',
  };

  const style = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.range.t - 1]}px`,
      left: `${ws.value[props.range.l - 1]}px`,
      width: `${ws.value[props.range.r] - ws.value[props.range.l - 1] + 1}px`,
      height: `${rs.value[props.range.b] - rs.value[props.range.t - 1] + 1}px`,
    };
  });
</script>

<style lang="less" scoped>
  .data-group {
    &__copy {
      position: absolute;
      background: rgba(0, 0, 0, 0.05);
      border: 2px solid transparent;
      padding: 4px;
      pointer-events: none;
      background-clip: content-box;
    }
    &__index {
      position: absolute;
      right: 6px;
      bottom: 6px;
      color: rgba(0, 0, 0, 0.1);
      font-size: 18px;
      line-height: 1em;
      &--row {
        left: 6px;
      }
    }
  }
</style>
