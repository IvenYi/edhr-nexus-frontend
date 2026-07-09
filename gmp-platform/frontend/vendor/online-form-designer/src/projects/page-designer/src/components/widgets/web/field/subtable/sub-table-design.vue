<template>
  <div>
    <div class="ks-row-middle mb5px">
      <div class="mr10px w-full flex" v-if="displayLabelText">
        <span class="required-gct" v-show="required">*</span>
        <span class="sub-table-title">
          <span> {{ widget.props.label || globFieldInfo.label }}</span>
          <info-circle-outlined class="ml5px explain-icon" v-if="!!showExplain" />
        </span>
      </div>
      <div class="max-h32px w22px! text-center ks-row-middle mr4px">
        <span
          v-if="widget.props.deviceConnectivity"
          class="gct-iconfont icon-icon_shebeihulian text-14px text-[#A6A6A6]"
        ></span>
      </div>
      <DesignTableButtons
        reverse
        class="ks-col"
        :buttons="btnGroupWidget.children"
        :parentWidget="widget"
        :visibleButtons="btnGroupWidget.visibleButtons"
      >
        <template #renderActions="args">
          <slot v-bind="args"></slot>
        </template>
      </DesignTableButtons>
    </div>
    <vxeRefTable
      :datasource="[{ index: 1 }]"
      :columns="tableColumns"
      :rowDragSort="rowDragSort"
      :operateColumn="operateColumn"
      :tableWidget="widget as SubTable"
      :editMethods="editMethods"
      :serialNumber="serialNumber"
      :editMode="editMode"
      :tableRowHeightNum="tableRowHeightNum"
      v-if="tableColumns.length"
    >
      <template #renderActions="args">
        <slot v-bind="args"></slot>
      </template>
    </vxeRefTable>
    <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed" v-else>
      <span class="text-[#c3c3c3] text-14px"> {{ t('sys.pageDesigner.selectFiledBtnTitle') }}</span>
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-sub-table">
  import { computed, inject, toRefs, toRef, provide, reactive } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import {
    vxeRefTable,
    DesignTableButtons,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeDesignTable';
  import { SubTable } from '/@/projects/page-designer/src/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAsyncFieldConfig } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import { transformButtons } from './components/transform';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const { t } = useI18n();
  const props = defineProps(widgetProps);
  const {
    serialNumber,
    rowDragSort,
    editMethods,
    editMode,
    required,
    showExplain,
    displayLabelText,
    cellHeightMode,
    cellHeight,
  } = toRefs(props.widget.props);

  const tableCellHeight = reactive({
    cellHeightMode: cellHeightMode?.value,
    cellHeight: cellHeight?.value,
  });
  provide('tableCellHeight', tableCellHeight);

  const { labelFont } = useStyle(props.widget);

  const btnGroupWidget = computed(() => {
    return props.widget.children![2];
  });
  const globFieldInfo = inject<any>('globFieldInfo', {});
  const tableColumns = computed(() => {
    return props.widget.children![3].children;
  });
  const operateColumn = toRef(() => {
    if (props.widget.children![1].children.length) {
      return props.widget.children![1];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
    operateColumn.value.id = undefined;
  }

  if (btnGroupWidget.value?.props) {
    btnGroupWidget.value.visibleButtons =
      btnGroupWidget.value.visibleButtons || btnGroupWidget.value.props.visibleButtons;
    btnGroupWidget.value.props = undefined;
    btnGroupWidget.value.id = undefined;
    btnGroupWidget.value.key = undefined;
  }

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });

  useAsyncFieldConfig(props.widget);
</script>

<style lang="less" scoped>
  .is-selected {
    outline: var(--ant-primary-color) solid 2px;
  }

  :deep(.active) {
    background-color: rgb(13 170 156 / 10%);
  }

  .required-gct {
    margin-right: 4px;
    color: #ff4d4f;
    font-family: SimSun, sans-serif;
  }

  .sub-table-title {
    flex: 1;
    color: v-bind('labelFont.color');
    font-size: v-bind('labelFont.fontSize');
    font-style: v-bind('labelFont.fontStyle');
    font-weight: v-bind('labelFont.fontWeight');
    text-align: v-bind('labelFont.textAlign');
    text-align-last: v-bind('labelFont.textAlign');
    text-decoration-line: v-bind('labelFont.textDecorationLine');

    .explain-icon {
      color: var(--ant-primary-color) !important;
    }
  }
</style>
