<template>
  <vxe-grid
    :class="['vxetable', gridType]"
    ref="tableRef"
    @resizable-change="resizableChange"
    min-height="90"
    :column-config="{ minWidth: 100, isHover: true, useKey: true }"
    :row-config="{ useKey: true, height: 56 }"
    :data="datasource"
    @header-cell-click="headerclick"
    @checkbox-change="checkboxChangeEvent"
    @checkbox-all="selectAllChangeEvent"
    :header-cell-class-name="getheaderClassName"
    :cell-class-name="getCellclassName"
    :edit-config="{ trigger: 'manual', mode: 'row' }"
    :columns="columnsOptions"
    :key="tableWidget.props.searchType"
    :border="multiLevelHeader"
  >
    <template #header="{ column: { params: i, treeNode } }">
      <widgetbar v-if="selecUpIcon(i)" :layout="['upper']" :parent-widget="tableWidget" />
      <div class="pl6px pr6px flex">
        <div :class="[ns.b('column-label')]">
          <div :class="ns.be('column-label', 'label')">
            <span class="error-gct" v-show="i.props.required">*</span>
            {{ i.props.label || i.alias }}
            <info-circle-outlined class="ml5px" v-if="!!i.props.showExplain" />
          </div>
        </div>
      </div>
    </template>
    <template #default="{ column: { params, treeNode }, row }">
      <div class="ks-row-middle">
        <table-cell
          class="ell"
          :columns="params"
          :rowReadonly="isClickEdit || isModalMode"
          :formData="row"
        />
        <MultiFieldDisplay
          :widget="params"
          :rowValue="row"
          :rowReadonly="isClickEdit || params.props.readonly || isModalMode"
          :isDesign="false"
        />
        <slot name="tree-remark" v-bind="{ treeNode, params, row }"></slot>
        <a
          class="iconfont icon-bianji ml5px"
          v-if="
            isClickEdit &&
            !params.props.readonly &&
            padVTableSupportEditFieldTypes.includes(params.props.fieldType)
          "
        ></a>
      </div>
    </template>
    <template #ope_header v-if="operateColumn">
      <!-- <i
        class="iconfont icon-fuzujian opt-icon"
        v-show="selecUpIcon(operateColumn)"
        @click.stop="setSelectedWidget(tableWidget)"
      ></i> -->
      <div class="pl10px pr10px pb12px pt10px"> {{ operateColumn!.props.label }}</div>
    </template>
    <template v-if="operateColumn" #ope_default="{ row, rowIndex }">
      <slot name="operate" v-bind="{ row, rowIndex }">
        <DesignTableColumnButtons
          :buttons="operateColumn!.children"
          :visible-buttons="operateColumn!.props.visibleButtons"
          :parentWidget="!rowIndex ? tableWidget : null"
        >
          <template #renderActions="args">
            <slot name="renderActions" v-bind="args"></slot>
          </template>
        </DesignTableColumnButtons>
      </slot>
    </template>
    <template #pager v-if="showPagination || tableWidget.props.showPagination">
      <!-- <a-pagination
        class="pagination-total-left"
        v-bind="paginationAttr"
        @change="showSizeChange"
        :page-size-options="['10', '20', '30', '40', '50']"
      /> -->
    </template>
    <template #content> <slot name="embed"></slot> </template>
  </vxe-grid>
</template>

<script setup lang="tsx">
  import { ref, computed, onMounted, nextTick, toRaw, watch } from 'vue';
  import {
    tableColumnWidthEnum,
    TableEditingMethodEnum,
    TableSearchTypeEnum,
    SUB_TABLE_EDIT_MODE,
  } from '/@page-designer/enum';
  import { isSortFiled } from '/@page-designer/utils';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useGetColumns } from './columnsOptions';
  import {
    OperateTable,
    ColumnTable,
    FormulaTable,
    DataTable,
    SubTable,
    DynamicTable,
  } from '/@/projects/page-designer/src/types/web';
  import { tableCell } from './table-component/index';
  import { useI18n } from 'vue-i18n';
  import { VxeTableEvents, VxeTableInstance } from 'vxe-table';
  import { TableTypeEnum, useNamespace } from '@gct/runtime';
  import widgetbar from '/@page-designer/components/widget-drag/widgetbar.vue';
  import { DesignTableColumnButtons } from '../design-table-buttons/design-table-column-buttons';
  import MultiFieldDisplay from '/@page-designer/components/widgets/pad/__components__/muti-field-display.vue';
  import { padVTableSupportEditFieldTypes } from '/@page-designer/schema/field/form/utils';
  import { cloneDeep, has } from 'lodash-es';

  const ns = useNamespace('vxe-design-table');
  const tableRef = ref(null);

  const { t } = useI18n();

  const emit = defineEmits(['onSelectChange', 'onSelectAllChange', 'checkboxEvent']);

  const { setSelectedWidget, selectedWidget } = useSelectedWidget();
  const props = defineProps<{
    datasource: { [key: string]: any }[];
    /**字段信息 */
    columns: (ColumnTable | FormulaTable)[];
    /** 是否可选*/
    rowSelection?: boolean;
    /**是否单选 */
    rowSelectionRadio?: boolean;
    /**操作配置 */
    operateColumn?: OperateTable;
    /**行拖拽 */
    rowDragSort?: boolean;
    /**开启分页 */
    showPagination?: boolean;
    tableWidget: DataTable | SubTable | DynamicTable;
    editMethods?: TableEditingMethodEnum;
    editMode?: SUB_TABLE_EDIT_MODE;
    serialNumber?: boolean;
    isTree?: boolean;
    gridType: TableTypeEnum;
    enableEmbed?: boolean;
    /**是否开启多级表头 */
    multiLevelHeader?: boolean;
    /**多级表头数组 key,title */
    levelHeaderGrouping?: any[];
  }>();

  const columnsOptions = useGetColumns(props);

  const isClickEdit = computed(() => {
    return props.editMethods === TableEditingMethodEnum.CLICKTOENTEREDITING;
  });

  const isModalMode = computed(() => {
    return props.editMode === SUB_TABLE_EDIT_MODE.MODAL;
  });

  function headerclick({ column, $event }) {
    // let widget: any = props.operateColumn;
    let widget: any;
    if (column.property) {
      widget = props.columns.find((i) => i.id === column.property);
    }
    if (widget) setSelectedWidget(widget);
    else setSelectedWidget(props.tableWidget);
    $event.stopPropagation();
  }

  function resizableChange({ column, resizeWidth, $event }) {
    $event.stopPropagation();
    let widget: any = props.operateColumn;
    if (column.property) {
      widget = props.columns.find((i) => i.id === column.property);
    }
    widget && setStyleWidth(widget, resizeWidth);
  }
  function setStyleWidth(widget, resizeWidth) {
    widget.style.columnwidth = resizeWidth;
    widget.style.columnwidthConfigure = tableColumnWidthEnum.ENUMERATION;
  }

  function selecUpIcon(info) {
    if (selectedWidget.value.id === info.id) {
      if (!has(selectedWidget.value, 'materialType') || !has(info, 'materialType')) {
        return true;
      } else {
        return selectedWidget.value.materialType === info.materialType;
      }
    }
    return false;
  }
  function getCellclassName({ column }) {
    if (!column?.params) return;
    if (selectedWidget.value.id === column?.params?.id) {
      return 'cell-active';
    }
  }
  function getheaderClassName({ column }) {
    if (!column?.params) return;
    if (selectedWidget.value.id === column?.params?.id) {
      return 'cursor-pointer active';
    }
    return 'cursor-pointer';
  }
  function getheaderClass(info, className = 'active') {
    if (selectedWidget.value.id === info) {
      return className;
    }
  }

  const paginationAttr = computed(() => {
    return {
      showSizeChanger: true,
      current: 1,
      pageSize: props.tableWidget.props.pageSize || 20,
      total: 40,
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  function showSizeChange(_current, pageSize) {
    props.tableWidget.props.pageSize = pageSize;
  }

  function expandAll(): void {
    if (tableRef.value) {
      const $table = tableRef.value as VxeTableInstance;
      nextTick(() => {
        $table.setAllRowExpand(true);
      });
    }
  }

  /**复选事件 */
  const checkboxChangeEvent: VxeTableEvents.CheckboxChange = ({ row, checked }) => {
    emit('onSelectChange', { row: toRaw(row), checked });
    const $table = tableRef.value;
    if ($table) {
      const records = $table.getCheckboxRecords();
      let rows = cloneDeep(records);
      emit('checkboxEvent', rows);
    }
  };

  /** 全选 */
  const selectAllChangeEvent: VxeTableEvents.CheckboxAll = ({ checked }) => {
    emit('onSelectAllChange', { checked });
    const $table = tableRef.value;
    if ($table) {
      const records = $table.getCheckboxRecords();
      let rows = cloneDeep(records);
      emit('checkboxEvent', rows);
    }
  };

  onMounted(() => {
    expandAll();
  });
</script>
<style lang="less">
  .gct-vxe-design-table-column-label {
    display: flex;
    width: 100%;
    padding: 4px;

    &__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gct-vxe-design-table-column-label__sort-icon {
      display: none;
    }
  }

  .gct-vxe-design-table-column-label.is-enable-sort {
    .gct-vxe-design-table-column-label__sort-icon {
      display: flex;
    }
  }

  .gct-vxe-design-table-column-label.is-top-sort {
    .gct-vxe-design-table-column-label__top-sort {
      color: var(--ant-primary-color);
    }
  }

  .gct-vxe-design-table-column-label.is-down-sort {
    .gct-vxe-design-table-column-label__down-sort {
      color: var(--ant-primary-color);
    }
  }

  .gct-vxe-design-table-column-label__sort-icon {
    flex-direction: column;
    justify-content: center;
    margin-left: 6px;
    color: #8f8f8f;
  }

  .gct-vxe-design-table-column-label__sort-icon-item {
    width: 6px;
    height: 6px;

    svg {
      fill: currentcolor;
      font-size: 6px;
      vertical-align: 12px;
    }
  }

  .gct-vxe-design-table-column-label__sort-icon-item:first-child {
    margin-bottom: 4px;

    svg {
      transform: rotate(-90deg);
    }
  }

  .gct-vxe-design-table-column-label__sort-icon-item:last-child {
    svg {
      transform: rotate(90deg);
    }
  }

  .vxetable {
    --vxe-table-column-hover-background-color: #f0f0f0;
    --vxe-table-column-padding-default: 0;

    .vxe-header--column:not(.col--seq, .col--checkbox, .col--radio) > .vxe-cell {
      padding: 0;
    }

    .vxe-cell {
      overflow: hidden;

      .table-actionItem {
        .ant-btn-link {
          padding: 0;
        }
      }
    }

    .vxe-header--column:has(+ .active) {
      .vxe-resizable.is--line::before {
        background-color: var(--ant-primary-color);
      }
    }

    .active {
      // z-index: 999;
      border-top: 1px solid var(--ant-primary-color) !important;
      border-right: 1px solid var(--ant-primary-color) !important;
      border-left: 1px solid var(--ant-primary-color) !important;
      background-color: rgba(from var(--ant-primary-color) r g b / 10%) !important;

      .vxe-resizable.is--line::before {
        background-color: var(--ant-primary-color);
      }
    }

    .cell-active {
      // z-index: 999;
      // border-top: none;
      border-right: 1px solid var(--ant-primary-color) !important;
      border-left: 1px solid var(--ant-primary-color) !important;
      background-color: rgba(from var(--ant-primary-color) r g b / 10%) !important;
    }

    .vxe-table--body .vxe-body--row {
      .cell-active {
        border-bottom: none;
      }
    }

    // .vxe-table--body .vxe-body--row:not(:last-child) {
    //   .cell-active {
    //     border-bottom: none;
    //   }
    // }

    .vxe-table--body .vxe-body--row:last-child,
    .vxe-table--body .vxe-body--row:has(+ .vxe-body--expanded-row:last-child) {
      .cell-active {
        &::after {
          content: '';
          position: absolute;
          bottom: 1px;
          width: 100%;
          height: 1px;
          background-color: var(--ant-primary-color);
        }
      }
    }

    .vxe-table--main-wrapper {
      padding-right: 1px;
      // padding-bottom: 1px;
      padding-left: 1px;
    }

    .vxe-table--header {
      padding-top: 1px;
    }

    .vxe-table--fixed-left-wrapper {
      left: 1px !important;
    }

    .vxe-table--fixed-right-wrapper {
      right: 1px !important;
    }

    .vxe-header--column {
      position: relative;
      border-top: 1px solid transparent;
      border-right: 1px solid transparent;
      border-left: 1px solid transparent;
    }

    .vxe-body--column {
      border-right: 1px solid transparent;
      border-left: 1px solid transparent;
    }

    .opt-icon {
      position: absolute;
      z-index: 4;
      top: 0;
      right: 0;
      color: var(--ant-primary-color);
      font-size: 14px;
      cursor: pointer;
    }

    .ant-pagination {
      margin-top: 10px;
      text-align: right;
    }
  }

  .vxe-grid.vxetable.embed {
    .table-header-container {
      margin-left: 16px;
    }
  }

  .vxe-grid.vxetable.sub {
    margin-left: 16px;

    .vxe-table--header {
      background-color: #f2f3f8;
    }

    .vxe-table--body {
      background-color: #fafbfc;
    }
  }

  .vxe-grid.vxetable.sub {
    .vxe-table--header {
      .vxe-table--header-border-line {
        border-bottom: 1px solid #eaedf1;
      }
    }
  }

  .pointer-none {
    pointer-events: none;
  }
  .vxe-table--render-default {
    font-size: 16px;
  }
</style>
