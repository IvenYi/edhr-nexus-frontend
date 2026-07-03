<template>
  <span
    class="dynamic-area__title"
    :class="{
      selected: isSelected,
    }"
    :style="titleStyle"
    @click="
      () =>
        setPanelData({
          type: PanelType.CheckTable,
          refId: id,
        })
    "
  >
    {{ $t('sys.onlineForm.inspectionItem') }}
    <ArrowUpOutlined
      class="arrow"
      @click="
        (e) => {
          turnToDataGroup(e);
        }
      "
    />
  </span>
  <div
    class="dynamic-area__mask"
    :class="{
      selected: isSelected,
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
    rowRange: {
      t: number;
      b: number;
      l: number;
      r: number;
    };
  }>();

  const {
    rowHeightStage: rs,
    colWidthStage: ws,
    setPanelData,
    panelData,
    paper,
  } = useSpreadSheet();

  const colorStyle = {
    '--hover-color': '#845832',
  };

  const style = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.rowRange.t - 1]}px`,
      left: `${ws.value[props.rowRange.l - 1]}px`,
      width: `${ws.value[props.rowRange.r] - ws.value[props.rowRange.l - 1] + 1}px`,
      height: `${rs.value[props.rowRange.b] - rs.value[props.rowRange.t - 1] + 1}px`,
    };
  });

  const titleStyle = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.rowRange.t - 1]}px`,
      left: `${ws.value[props.rowRange.r]}px`,
    };
  });

  const isSelected = computed(() => {
    return PanelType.CheckTable === panelData.type && props.id === panelData.refId;
  });

  const table = computed(() => {
    return paper.value.fixedTables!.find((item) => item.id === panelData.refId)!;
  });

  const turnToDataGroup = (e: MouseEvent) => {
    // 没选中的时候直接不管冒泡后触发选中
    if (!isSelected.value) {
      return;
    }
    e.stopPropagation();
    if (!table.value.dgRange) {
      return;
    }
    setPanelData({
      type: PanelType.DataGroup2D,
      refId: props.id,
    });
  };
</script>

<style lang="less" scoped>
  .dynamic-area__title {
    padding-right: 6px;
  }
</style>
