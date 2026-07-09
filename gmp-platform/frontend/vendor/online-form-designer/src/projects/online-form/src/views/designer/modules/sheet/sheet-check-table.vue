<template>
  <div class="dynamic-area__mask" :style="style"> </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { computed } from 'vue';

  const props = defineProps<{
    id: string;
    range: {
      t: number;
      b: number;
      l: number;
      r: number;
    };
  }>();

  const { rowHeightStage: rs, colWidthStage: ws, setPanelData, panelData } = useSpreadSheet();

  const colorStyle = {
    '--hover-color': '#845832',
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

<style lang="less" scoped></style>
