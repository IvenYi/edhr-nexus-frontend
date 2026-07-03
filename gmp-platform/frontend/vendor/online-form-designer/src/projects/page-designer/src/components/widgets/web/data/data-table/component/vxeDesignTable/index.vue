<template>
  <vxe-grid
    :class="['vxetable', gridType, rowHeightClass, { 'header-height-sync': cellHeaderHeightSync }]"
    :style="getTableStyle()"
    ref="tableRef"
    @resizable-change="resizableChange"
    min-height="90"
    :column-config="{ minWidth: 100, isHover: true, useKey: true }"
    :row-config="rowConfig"
    :data="datasource"
    @header-cell-click="headerclick"
    @radio-change="radioChangeEvent"
    @checkbox-change="checkboxChangeEvent"
    @checkbox-all="selectAllChangeEvent"
    :header-cell-class-name="getheaderClassName"
    :cell-class-name="getCellclassName"
    :edit-config="{ trigger: 'manual', mode: 'row' }"
    :columns="columnsOptions"
    :key="tableWidget.props.searchType"
    :border="multiLevelHeader"
  >
    <template #groupHeader="{ column }">
      <div class="pt12px pb12px pl6px pr6px text-center"> {{ column.title }} </div>
    </template>
    <template #header="{ column: { params: i, treeNode } }">
      <widgetbar v-if="selecUpIcon(i)" :layout="['upper']" :parent-widget="tableWidget" />
      <div
        v-if="
          tableWidget.props.searchType === TableSearchTypeEnum.EMBEDDED &&
          i.props.embeddedSearch &&
          i.children?.[0]
        "
        @click.stop="setSelectedWidget(i.children![0])"
        class="mb10px pl10px pr10px"
        :class="getheaderClass(i.children![0].id)"
      >
        <widgetbar v-if="selecUpIcon(i.children![0]) " :layout="['upper']" :parent-widget="i" />

        <div class="ks-row-middle pointer-none" v-if="i.children![0].props.isRang">
          <a-input :placeholder="i.children![0].props.placeholder" readonly />
          <div class="w10 text-center">-</div>
          <a-form-item-rest>
            <a-input :placeholder="i.children![0].props.placeholder" readonly />
          </a-form-item-rest>
        </div>
        <a-input :placeholder="i.children![0].props.placeholder" v-else class="pointer-none" />
      </div>
      <div class="pl6px pr6px flex">
        <div
          :class="[
            ns.b('column-label'),
            ns.is(
              'enable-sort',
              tableWidget.props.headerSort == true &&
                i.props.isCustomField !== true &&
                isSortFiled(i.props.fieldType),
            ),
          ]"
        >
          <div :class="ns.be('column-label', 'label')">
            <span class="error-gct" v-show="i.props.required">*</span>
            {{ i.props.label || i.alias }}
            <info-circle-outlined class="ml5px" v-if="!!i.props.showExplain" />
          </div>
          <div :class="ns.be('column-label', 'sort-icon')" v-if="!isTree || treeNode">
            <div
              :class="[ns.be('column-label', 'sort-icon-item'), ns.be('column-label', 'top-sort')]"
            >
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="6"
              >
                <path
                  d="M81.07414302 12.806177l864.8255397 499.32190379-864.8255397 499.32190492v-998.64380871z"
                />
              </svg>
            </div>
            <div
              :class="[ns.be('column-label', 'sort-icon-item'), ns.be('column-label', 'down-sort')]"
            >
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="6"
              >
                <path
                  d="M81.07414302 12.806177l864.8255397 499.32190379-864.8255397 499.32190492v-998.64380871z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #default="{ column: { params, treeNode }, row }">
      <div class="flex justify-around w100%">
        <div
          class="ks-row w100% h100%"
          :style="{
            width: isClickEdit && !params.props.readonly ? 'calc(100% - 22px)' : '100%',
            display: 'flex',
            justifyContent: transformFont2flexStyle(params),
          }"
          :class="{ 'overflow-hidden': isClickEdit || isModalMode }"
        >
          <table-cell
            class="min-w-16px"
            :class="{
              'line-clamp': params.props.readonly || isClickEdit,
              ell: props.tableRowHeightNum === 1 || !props.tableRowHeightNum,
            }"
            :columns="params"
            :rowReadonly="isClickEdit || isModalMode"
            :formData="row"
            :readonly="params.props.readonly || isClickEdit"
          />
          <MultiFieldDisplay
            :widget="params"
            :rowReadonly="isClickEdit || params.props.readonly"
            :isDesign="props.isDesign"
          />
        </div>

        <slot name="tree-remark" v-bind="{ treeNode, params, row }"></slot>
        <a
          class="iconfont icon-bianji ml5px pt9px"
          v-if="isClickEdit && !params.props.readonly"
        ></a>
      </div>
    </template>
    <template #ope_header v-if="operateColumn">
      <!-- <i
        class="iconfont icon-fuzujian opt-icon"
        v-show="selecUpIcon(operateColumn)"
        @click.stop="setSelectedWidget(tableWidget)"
      ></i> -->
      <div class="pl10px pr10px"> {{ t(operateColumn.name) || operateColumn!.props.label }}</div>
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
      <a-pagination
        class="pagination-total-left"
        v-bind="paginationAttr"
        @change="showSizeChange"
        :page-size-options="['10', '20', '30', '40', '50']"
      />
    </template>
    <template #content> <slot name="embed"></slot> </template>
  </vxe-grid>
</template>

<script setup lang="tsx">
  import { ref, computed, onMounted, nextTick, toRaw, inject } from 'vue';
  import {
    tableColumnWidthEnum,
    TableEditingMethodEnum,
    TableSearchTypeEnum,
    SUB_TABLE_EDIT_MODE,
    FormComponents,
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
  import { TABLE_CELL_HEIGHT_MODE, TableTypeEnum, useNamespace } from '@gct/runtime';
  import widgetbar from '/@page-designer/components/widget-drag/widgetbar.vue';
  import { DesignTableColumnButtons } from '../design-table-buttons/design-table-column-buttons';
  import { cloneDeep, has } from 'lodash-es';
  import MultiFieldDisplay from '../../../../__components__/formcomponent/field-label/muti-field-display.vue';
  import { transformFont2flexStyle } from '../transform';

  const ns = useNamespace('vxe-design-table');

  const tableCellHeight = inject('tableCellHeight');

  const tableRef = ref(null);

  const { t } = useI18n();

  const emit = defineEmits(['onSelectChange', 'onSelectAllChange', 'checkboxEvent', 'radioEvent']);

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
    /** 是否开启多级表头 */
    multiLevelHeader?: boolean;
    /** 多级表头数组 key,title */
    levelHeaderGrouping?: any[];
    isDesign?: boolean;
    /** 表格单行显示文字行数，-1 表示不限制, 正数表示限制行数 */
    tableRowHeightNum?: number;
    /** 表头行高是否同步单元格行高模式 */
    cellHeaderHeightSync?: boolean;
  }>();

  const columnsOptions = useGetColumns(props);

  const isClickEdit = computed(() => {
    return props.editMethods === TableEditingMethodEnum.CLICKTOENTEREDITING;
  });

  const isModalMode = computed(() => {
    return props.editMode === SUB_TABLE_EDIT_MODE.MODAL;
  });

  const rowConfig = computed(() => {
    if (props.tableRowHeightNum === 1) {
      return { useKey: true, height: 56 };
    }
    return { useKey: true, height: 'auto' };
  });

  const rowHeightClass = computed(() => {
    if (props.tableRowHeightNum === 1) return 'row-height-one';
    if (props.tableRowHeightNum > 1) return 'row-height-custom';
    return 'row-height-auto';
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

  function getTableStyle() {
    if (props.tableRowHeightNum && props.tableRowHeightNum > 1) {
      return { '--table-cell-line-clamp': props.tableRowHeightNum };
    }
    return undefined;
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

  /**单选事件 */
  const radioChangeEvent: VxeTableEvents.RadioChange = ({ row }) => {
    emit('radioEvent', toRaw(row));
    emit('onSelectChange', { row: toRaw(row), checked: true });
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

  defineExpose({
    getXtable: () => {
      return tableRef.value;
    },
  });
</script>
<style lang="less">
  .gct-vxe-design-table-column-label {
    display: inline-flex;
    width: 100%;
    padding: 4px 0;
    cursor: pointer;

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
    &:hover {
      border-radius: 4px;
      background-color: #e5ebf0;
    }

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
      height: v-bind("(tableRowHeightNum === 1||!tableRowHeightNum)?'auto':'100%'");
      overflow: hidden;
      .vxe-cell--tree-node,
      .vxe-tree-cell {
        width: 100%;
      }
      .vxe-tree-cell {
        // padding-top: 5px;
      }
      > div {
        height: 100%;

        .table-form-item {
          height: 100%;

          .ant-form-item-control {
            height: 100%;

            .ant-form-item-control-input {
              height: 100%;

              .ant-form-item-control-input-content {
                height: 100%;

                .ks-row-middle {
                  height: 100%;
                }
              }
            }
          }
        }
      }

      .gct-table-actionItem {
        // height: auto;
      }

      .table-actionItem {
        .ant-btn-link {
          padding: 0;
        }
      }
    }

    .vxe-body--column {
      .vxe-cell {
        padding: 4px 12px;
      }
    }

    .vxe-body--column.col--radio,
    .vxe-body--column.col--checkbox {
      .vxe-cell {
        > label {
          display: flex;
          align-items: center;
          height: 40px;
        }

        .vxe-cell--checkbox {
          display: flex;
          align-items: center;
          height: 40px;
        }
      }
    }

    .vxe-body--column.col--seq,
    .vxe-body--column.operate,
    .vxe-body--column.col--expand {
      .vxe-cell {
        line-height: 40px;

        .gct-table-actionItem {
          line-height: 40px;
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

      .vxe-table--header-border-line {
        border-bottom: 1px solid #eaedf1;
      }
    }

    .vxe-table--body {
      background-color: #fafbfc;
    }
  }

  .pointer-none {
    pointer-events: none;
  }

  .vxetable.row-height-one,
  .vxetable.row-height-auto,
  .vxetable.row-height-custom {
    --vxe-table-row-height-default: 48px;
  }

  .vxetable.row-height-auto.header-height-sync {
    .gct-vxe-design-table-column-label__label {
      white-space: normal;
    }
  }

  .vxetable.row-height-custom.header-height-sync {
    .gct-vxe-design-table-column-label__label {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--table-cell-line-clamp, 10);
      white-space: normal;
    }
  }

  .line-clamp {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-line-clamp: var(--table-cell-line-clamp, 10); /* 显示几行就改几 */
    -webkit-box-orient: vertical;
  }
</style>
