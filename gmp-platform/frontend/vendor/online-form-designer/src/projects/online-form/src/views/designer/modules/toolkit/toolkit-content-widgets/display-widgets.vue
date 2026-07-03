<template>
  <div class="wrapper">
    <div class="title">{{ $t('sys.onlineForm.displayComponent') }}</div>
    <ul @dragstart="handleDragStart" v-if="validWidgetList.length">
      <li
        v-for="item in filterValidWidgetList"
        :key="item.type"
        :data-widget="item.type"
        draggable="true"
      >
        <i class="iconfont" :class="item.icon"></i>
        {{ item.name }}</li
      >
    </ul>
    <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="null" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';
  import { asyncImportWidgetConfigList } from '/@online-form/views/__widgets__';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';

  import {
    TransferType,
    setTransferData,
  } from '/@online-form/views/designer/modules/base/drag/use-drop';

  const PaperWidgeType = {
    RangeLimit: 'rangelimit',
    Serialnumber: 'serialnumber',
    TimeDiff: 'timediff',
    Power: 'power',
  } as const;

  const widgetConfigList = asyncImportWidgetConfigList();

  const { panelData, currentCell, isTextOnlineForm } = useSpreadSheet();

  const validWidgetList = computed(() => {
    if (currentCell.value?.data?.multiFields && [PanelType.Cell].includes(panelData.type))
      return [];
    const dropPanelTypeMap = {
      [PanelType.PaperWidget]: PanelType.Paper,
      [PanelType.DynamicTable]: PanelType.Cell,
      [PanelType.FixedTable]: PanelType.Cell,
      [PanelType.DataGroup]: PanelType.Cell,
    };
    const type = dropPanelTypeMap[panelData.type] ?? panelData.type;
    if (
      ![PanelType.Cell, PanelType.Paper, PanelType.PaperHeader, PanelType.PaperFooter].includes(
        type,
      )
    ) {
      return widgetConfigList;
    }
    return widgetConfigList.filter((item) => item.dragToPos.includes(type));
  });

  const filterValidWidgetList = computed(() => {
    if (isTextOnlineForm.value) {
      return validWidgetList.value.filter(
        (item) =>
          ![
            PaperWidgeType.RangeLimit,
            PaperWidgeType.Serialnumber,
            PaperWidgeType.TimeDiff,
            PaperWidgeType.Power,
          ].includes(item.type),
      );
    }
    return validWidgetList.value.filter((item) => ![PaperWidgeType.RangeLimit].includes(item.type));
  });

  function handleDragStart(e) {
    const source = e.target.closest('[data-widget]');
    const widget = source?.dataset.widget;
    if (!widget) {
      return;
    }
    const defaultWidgetConfig = widgetConfigList.find((item) => item.type === widget);

    const newWidget = cloneDeep(defaultWidgetConfig)!;
    newWidget.id = `${widget}${Math.random().toString(36).substring(2, 10)}`;

    setTransferData(e, { type: TransferType.Widget, data: newWidget });
  }
</script>

<style lang="less" scoped>
  .wrapper {
    padding: 12px;
  }
  .title {
    font-weight: bold;
    margin-bottom: 12px;
  }
  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: repeat(2, 1fr);

    li {
      height: 34px;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      display: flex;
      align-items: center;
      padding: 0 8px;
      color: #212528;
      font-size: 12px;
      cursor: pointer;

      .iconfont {
        margin-right: 6px;
        color: #797a7d;
      }
    }
  }
</style>
