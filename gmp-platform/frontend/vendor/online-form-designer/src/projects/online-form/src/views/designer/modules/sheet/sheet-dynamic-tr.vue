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
          type: panelTypeMap[type],
          refId: id,
        })
    "
  >
    {{ tableTypeLabel }}
    <ArrowUpOutlined
      v-if="SubTableType._2D === type"
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
    <div
      v-if="!dgRange && SubTableType._2D === type"
      class="h-full w-full flex justify-center items-center overflow-hidden text-16px color-[#ddd]"
    >
      {{ $t('sys.onlineForm.pleaseConfigureDynamicAssociation') }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType, SubTableType } from '/@online-form/views/designer/enums';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { IRange } from '/@online-form/views/designer/types';

  const props = defineProps<{
    id: string;
    type?: SubTableType;
    dgRange?: IRange;
    range: {
      t: number;
      b: number;
      l: number;
      r: number;
    };
  }>();

  const panelTypeMap = {
    [SubTableType.DEFAULT]: PanelType.DynamicTable,
    [SubTableType._2D]: PanelType._2DTable,
    [SubTableType.MATERIAL_CONSUMPTION]: PanelType.MaterialConsumptionTable,
    [SubTableType.MATERIAL_BALANCE]: PanelType.MaterialBalanceTable,
  };

  const tableTypeLabel = computed(() => {
    return props.type === SubTableType.DEFAULT || !props.type
      ? t('sys.onlineForm.subTableType.DYNAMIC')
      : t(`sys.onlineForm.subTableType.${props.type}`);
  });

  const { t } = useI18n();
  const {
    rowHeightStage: rs,
    colWidthStage: ws,
    setPanelData,
    panelData,
    paper,
  } = useSpreadSheet();

  const colorMaps = {
    [SubTableType.MATERIAL_CONSUMPTION]: '#4C8CAA',
    [SubTableType.MATERIAL_BALANCE]: '#35975E',
  };

  const colorStyle = {
    '--hover-color': colorMaps[props.type!] || '#7030cb',
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

  const titleStyle = computed(() => {
    return {
      ...colorStyle,
      top: `${rs.value[props.range.t - 1]}px`,
      left: `${ws.value[props.range.r]}px`,
    };
  });

  const isSelected = computed(() => {
    return (
      [
        PanelType.DynamicTable,
        PanelType._2DTable,
        PanelType.MaterialConsumptionTable,
        PanelType.MaterialBalanceTable,
      ].includes(panelData.type) && props.id === panelData.refId
    );
  });

  const table = computed(() => {
    return paper.value.dynamicTables!.find((item) => item.id === panelData.refId)!;
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

<style lang="less" scoped></style>
