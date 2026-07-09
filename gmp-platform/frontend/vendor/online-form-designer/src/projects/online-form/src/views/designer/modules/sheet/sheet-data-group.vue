<template>
  <span
    class="dynamic-area__title"
    :class="{
      selected: PanelType.DataGroup === panelData.type && id === panelData.refId,
    }"
    :style="titleStyle"
    @click="
      () =>
        setPanelData({
          type: PanelType.DataGroup,
          refId: id,
        })
    "
  >
    {{ $t('sys.onlineForm.dataGrouping') }}
    <ArrowDownOutlined
      @click="
        (e) => {
          e.stopPropagation();
          setPanelData({
            type: PanelType.FixedTable,
            refId: id,
          });
        }
      "
    />
  </span>
  <div
    class="dynamic-area__mask"
    :class="{
      selected: PanelType.DataGroup === panelData.type && id === panelData.refId,
    }"
    :style="style"
  >
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { computed } from 'vue';

  const props = defineProps<{
    id: string;
    dgRange: {
      t: number;
      b: number;
      l: number;
      r: number;
    };
  }>();

  const { rowHeightStage: rs, colWidthStage: ws, setPanelData, panelData } = useSpreadSheet();

  const colorStyle = {
    '--hover-color': '#F79133',
  };

  const style = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.dgRange.t - 1]}px`,
      left: `${ws.value[props.dgRange.l - 1]}px`,
      width: `${ws.value[props.dgRange.r] - ws.value[props.dgRange.l - 1] + 1}px`,
      height: `${rs.value[props.dgRange.b] - rs.value[props.dgRange.t - 1] + 1}px`,
    };
  });

  const titleStyle = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.dgRange.t - 1]}px`,
      left: `${ws.value[props.dgRange.r]}px`,
    };
  });
</script>

<style lang="less" scoped>
  .dynamic-area__title {
    padding-right: 6px;
  }
</style>
