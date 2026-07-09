<template>
  <div style="width: 100%">
    <div
      class="data-table-header-container"
      v-if="
        fullScreen ||
        currentReload ||
        customHeader ||
        (rowSelection && selects.length) ||
        batchBtnGroup ||
        headerBtnGroup
      "
    >
      <div class="table-header-left">
        <div v-if="batchBtnGroup && rowSelection && selects.length > 0" class="batch-btn-group">
          <DesignTableButtons
            :parentWidget="widget"
            :visible-buttons="batchBtnGroup?.visibleButtons"
            :buttons="batchBtnGroup.children"
          >
            <template #renderActions="args">
              <slot v-bind="args"></slot>
            </template>
          </DesignTableButtons>
        </div>
      </div>
      <div class="table-header-right">
        <div
          v-if="headerBtnGroup?.children?.length && selects.length == 0"
          class="header-btn-group"
        >
          <DesignTableButtons
            :parentWidget="widget"
            :visible-buttons="headerBtnGroup?.visibleButtons"
            :buttons="headerBtnGroup?.children"
            :reverse="true"
          >
            <template #renderActions="args">
              <slot v-bind="args"></slot>
            </template>
          </DesignTableButtons>
        </div>
        <div class="ks-row-middle p10px" v-if="fullScreen || currentReload || customHeader">
          <div class="ks-col"></div>
          <a-button v-show="fullScreen">
            <template #icon> <FullscreenOutlined /></template>
          </a-button>
          <a-button v-show="currentReload" class="ml10px">
            <template #icon> <reload-outlined class="text-20px" /></template>
          </a-button>
          <a-button v-show="customHeader" class="ml10px">
            <template #icon> <span class="iconfont icon-shezhi"></span></template>
          </a-button>
        </div>
      </div>
    </div>

    <vxeRefTable
      isTree
      :tree-config="{
        transform: true,
        rowField: 'id_',
        parentField: 'parent_id_',
        expandAll: true,
      }"
      :height="height"
      :serialNumber="serialNumber"
      :rowSelection="rowSelection"
      :rowSelectionRadio="rowSelectionRadio"
      :datasource="datasource"
      :columns="tableColumns"
      :rowdraggable="rowdraggable"
      :operateColumn="operateColumn"
      :tableWidget="widget"
      @checkboxEvent="checkboxEvent"
      :levelHeaderGrouping="widget.props.levelHeaderGrouping"
      :multiLevelHeader="widget.props.multiLevelHeader"
      :tableRowHeightNum="tableRowHeightNum"
      v-if="tableColumns.length"
      :isDesign="true"
    >
      <template #tree-remark="{ treeNode, params, row }">
        <span v-if="treeNode && params.props.readonly">{{ row.remark_no }}</span>
        <span
          v-else-if="params.props.field === 'parent_id_' && row.parent_id_ && params.props.readonly"
          >{{ `(${row.parent_id_})` }}</span
        >
      </template>
      <template #renderActions="args">
        <slot v-bind="args"></slot>
      </template>
    </vxeRefTable>
    <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed" v-else-if="model">
      <span class="text-[#c3c3c3] text-14px"> {{ $t('sys.pageDesigner.selectModelFields') }}</span>
    </div>
    <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed" v-else>
      <span class="text-[#c3c3c3] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-tree-table">
  import { toRefs, toRef, ref, computed, provide, reactive } from 'vue';
  import { TreeTable } from '/@page-designer/types/web';
  import { vxeRefTable, useTableLayout } from '../data-table/component/vxeDesignTable';
  import { DesignTableButtons } from '../data-table/component/design-table-buttons/design-table-buttons';
  import { selectionTypeEnums, TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';
  import { transformButtons } from './transform';

  const props = defineProps<{ widget: TreeTable }>();

  const selects = ref<any[]>([]);

  const {
    fullScreen,
    currentReload,
    customHeader,
    model,
    rowdraggable,
    serialNumber,
    cellHeightMode,
    cellHeight,
  } = toRefs(props.widget.props);
  const rowSelectionType = toRef(() => props.widget.props.rowSelectionType);
  /**多选标识 兼容老数据 */
  const rowSelection = toRef(() => {
    if (props.widget.props.rowSelection) return true;
    return rowSelectionType?.value === selectionTypeEnums.MultipleChoice;
  });
  const rowSelectionRadio = toRef(() => rowSelectionType.value === selectionTypeEnums.SingleChoice);
  const { height } = useTableLayout(props.widget);

  const tableColumns = toRef(() => {
    return props.widget.children![1].children;
  });
  const operateColumn = toRef(() => {
    if (props.widget.children![0].children.length) {
      return props.widget.children![0];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
    operateColumn.value.id = undefined;
  }
  const batchBtnGroup = toRef(() => {
    if (props.widget.children![3]?.children?.length) {
      return props.widget.children![3];
    }
  });

  const headerBtnGroup = toRef(() => {
    if (props.widget.children![2]?.children?.length) {
      return props.widget.children![2];
    }
  });
  /**老数据兼容 */
  if (headerBtnGroup.value?.props) {
    headerBtnGroup.value.visibleButtons =
      headerBtnGroup.value.visibleButtons || headerBtnGroup.value.props.visibleButtons;
    headerBtnGroup.value.props = undefined;
  }
  /**老数据兼容 */
  if (batchBtnGroup.value?.props) {
    batchBtnGroup.value.visibleButtons =
      batchBtnGroup.value.visibleButtons || batchBtnGroup.value.props.visibleButtons;
    batchBtnGroup.value.props = undefined;
  }

  const tableCellHeight = reactive({
    cellHeightMode: cellHeightMode?.value,
    cellHeight: cellHeight?.value,
  });
  provide('tableCellHeight', tableCellHeight);

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });
  //TODO目前只查实体模型 等有虚拟模型再改动
  // rowSelectionType.value

  const datasource = computed(() => {
    const firstField = tableColumns.value?.[0];
    const obj =
      firstField.props.field !== 'parent_id_'
        ? { tree_first_field_type: firstField?.props?.fieldType }
        : {};

    return [
      { id_: 1, parent_id_: null, remark_no: '(1)', ...obj },
      { id_: 2, parent_id_: 1, remark_no: '(1.1)', ...obj },
      { id_: 3, parent_id_: null, remark_no: '(2)', ...obj },
    ];
  });

  const checkboxEvent = (rows) => {
    selects.value = rows;
  };
</script>
<style scoped lang="scss">
  .data-table-header-container {
    display: flex;
    justify-content: space-between;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .header-btn-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
