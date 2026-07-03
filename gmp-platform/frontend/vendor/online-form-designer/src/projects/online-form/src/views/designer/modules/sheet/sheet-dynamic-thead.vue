<template>
  <span
    class="dynamic-area__title"
    :style="titleStyle"
    @click="
      () =>
        setPanelData({
          type: PanelType.TableHeader,
          refId: id,
        })
    "
    >{{ $t('sys.onlineForm.formHeader') }}</span
  >
  <div class="dynamic-area__mask" :style="style"> </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { computed } from 'vue';

  const props = defineProps<{
    id: string;
    thRange: {
      t: number;
      b: number;
      l: number;
      r: number;
    };
  }>();

  const { rowHeightStage: rs, colWidthStage: ws, setPanelData } = useSpreadSheet();

  const colorStyle = {
    '--hover-color': '#B54096',
  };

  const style = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.thRange.t - 1]}px`,
      left: `${ws.value[props.thRange.l - 1]}px`,
      width: `${ws.value[props.thRange.r] - ws.value[props.thRange.l - 1] + 1}px`,
      height: `${rs.value[props.thRange.b] - rs.value[props.thRange.t - 1] + 1}px`,
    };
  });

  const titleStyle = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.thRange.t - 1]}px`,
      left: `${ws.value[props.thRange.r]}px`,
    };
  });
</script>

<style lang="less" scoped></style>
