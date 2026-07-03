<template>
  <vxe-grid
    class="vxetable"
    ref="xGrid"
    @resizable-change="resizableChange"
    min-height="90"
    :column-config="{ isHover: true }"
    :row-config="{ useKey: true, height: 50 }"
    :data="datasource"
    @header-cell-click="headerclick"
    header-cell-class-name="cursor-pointer"
    border
    :edit-config="{ trigger: 'manual', mode: 'row' }"
    :columns="columnsOptions"
  >
    <template #header="{ column: { params: i } }">
      <!-- <i
        class="iconfont icon-fuzujian opt-icon"
        v-if="selecUpIcon(i.id)"
        @click.stop="setSelectedWidget(tableWidget)"
      ></i> -->
      <suspension
        :rootRef="columnRef"
        v-if="selecUpIcon(i.id)"
        :key="columnRef"
        :layout="['upper']"
        :parent-widget="tableWidget"
      />
      {{ i.props.label || i.alias }}
    </template>
    <template #default="{ column: { params, treeNode }, row }">
      <div class="ks-row-middle">
        <div
          class="ks-row items-center w100% overflow-hidden"
          :style="{
            display: 'flex',
            justifyContent: transformFont2flexStyle(params),
          }"
        >
          <table-cell class="ell" :columns="params" :formData="row" />
        </div>
        <slot name="tree-remark" v-bind="{ treeNode, params, row }"></slot>
      </div>
    </template>
  </vxe-grid>
</template>

<script setup lang="tsx">
  import { ref, torefs, toRef, computed, reactive } from 'vue';
  import { tableColumnWidthEnum } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useGetColumns } from './columnsOptions';
  import { ColumnTable, FormulaTable, DataTable, SubTable } from '/@page-designer/types/web';
  import { tableCell } from './table-component/index';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { selectionTypeEnums } from '/@/enums/appEnum';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';
  import { forEachRight } from 'lodash-es';
  import { transformFont2flexStyle } from '../transform';

  const { setSelectedWidget, selectedWidget } = useSelectedWidget();
  const props = defineProps<{
    datasource: { [key: string]: any }[];
    /**字段信息 */
    columns: (ColumnTable | FormulaTable)[];
    /**行拖拽 */
    rowdraggable?: boolean;
    tableWidget: DataTable | SubTable;
    serialNumber?: boolean /** 是否可选*/;
    rowSelection?: boolean;
    /**单选多选 */
    rowSelectionType?: selectionTypeEnums;
    isTree?: boolean;
  }>();
  forEachRight(props.columns, (i, index) => {
    initFieldWidgetRuntime(i)
      .then((fieldInfo) => {
        i.alias = i.props.label || fieldInfo?.name;
      })
      .catch((err) => {
        //通过倒序遍历删除 不存在的字段
        props.columns.splice(index, 1);
      });
  });

  const columnsOptions = useGetColumns(props, getheaderClass);

  const columnRef = ref();

  function headerclick({ column, $event }) {
    let widget: any = props.columns.find((i) => i.props.field === column.property);
    widget && setSelectedWidget(widget);
    $event.stopPropagation();
    setTimeout(() => {
      columnRef.value = document.querySelector(`th.vxe-header--column.active`);
    });
  }

  function resizableChange({ column, resizeWidth, $event }) {
    $event.stopPropagation();
    let widget: any = props.columns.find((i) => i.props.field === column.property);
    widget && setStyleWidth(widget, resizeWidth);
  }

  function setStyleWidth(widget, resizeWidth) {
    widget.style.columnwidth = Math.floor(resizeWidth / 3.75);
    widget.style.columnwidthConfigure = tableColumnWidthEnum.PERCENTAGE;
  }
  function selecUpIcon(id) {
    return selectedWidget?.value?.id == id;
  }
  function getheaderClass(id, className = 'active') {
    if (selectedWidget.value.id == id) {
      return className;
    } else {
      return 'none-active';
    }
  }
</script>
<style lang="less">
  .vxetable {
    --vxe-table-column-hover-background-color: #f0f0f0;
    // --vxe-table-column-padding-default: 0;

    // .vxe-header--column:not(.col--seq, .col--checkbox, .col--radio) > .vxe-cell {
    //   padding: 0;
    // }

    .active {
      border: 1px solid var(--ant-primary-color) !important;
      background-color: rgba(from var(--ant-primary-color) r g b / 10%) !important;
    }

    .cell-active {
      border: 1px solid var(--ant-primary-color);
      border-top: none;
      background-color: rgba(from var(--ant-primary-color) r g b / 10%) !important;
    }

    .vxe-table--body .vxe-body--row:not(:last-child) {
      .cell-active {
        border-bottom: none;
      }
    }

    .none-active {
      border: 1px solid transparent;
    }

    .vxe-table--main-wrapper {
      padding-right: 1px;
      padding-bottom: 1px;
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
  }
</style>
