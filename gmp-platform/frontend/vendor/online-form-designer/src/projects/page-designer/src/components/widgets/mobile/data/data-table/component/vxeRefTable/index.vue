<template>
  <vxe-table
    class="select-none vxetable"
    min-height="90"
    :row-config="{ isHover: true, useKey: true }"
    border
    ref="xTable"
    :data="datasource"
    :loading="loading"
    @cell-click="cellClickEvent"
    @radio-change="radioChangeEvent"
    @checkbox-change="checkboxChangeEvent"
    @checkbox-all="selectAllChangeEvent"
    :cell-style="cellStyle"
    @scroll="scroll"
    :checkbox-config="{ highlight: true }"
    :radio-config="{ highlight: true }"
  >
    <vxe-column width="35" v-if="rowdraggable">
      <span class="cursor-move mover iconfont icon-drag"></span>
    </vxe-column>
    <vxe-column
      type="radio"
      width="60"
      v-if="rowSelection && rowSelectionType === selectionTypeEnums.SingleChoice"
    />
    <vxe-column
      type="checkbox"
      width="60"
      v-if="rowSelection && rowSelectionType === selectionTypeEnums.MultipleChoice"
    />
    <vxe-column type="seq" width="60" v-if="serialNumber">
      <template #header> {{ $t('序号') }} </template>
    </vxe-column>
    <vxe-column
      :visible="!i.props.hidden"
      show-overflow="ellipsis"
      :field="i.props.field"
      :title="i.title"
      :key="index"
      :treeNode="isTree ? !index : false"
      :fixed="i.props.fixedAlign"
      :width="i.width"
      v-for="(i, index) in showColumns"
    >
      <!-- <template #default="{ row, rowIndex }">
        <table-cell :columns="i" :rowValue="row" :index="rowIndex" />
      </template>
      <template #default="{ row, rowIndex }">
        <table-cell :columns="i" :rowValue="row" :index="rowIndex" />
      </template> -->
      <template #default="{ row, rowIndex }">
        <table-cell :columns="i" :rowValue="row" :index="rowIndex" />
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script setup lang="ts">
  import { ref, toRefs, toRaw, onMounted, computed, onUnmounted } from 'vue';
  import { tableColumnWidthEnum } from '/@page-designer/enum';
  import { VxeTableInstance, VxeTableEvents } from 'vxe-table';
  import { columnsType } from '../../type';
  import Sortable from 'sortablejs';
  import { isNullAndUnDef } from '/@/utils/is';
  import { tableCell } from './table-component/index';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { cloneDeep } from 'lodash-es';
  import { selectionTypeEnums } from '/@/enums/appEnum';
  import { tableWidgetToShow } from '/@web-render/render/Event/Dependency/useDependencyToShow';

  const props = defineProps<{
    datasource: any[];
    loading?: boolean;
    cacheColumns: columnsType;
    rowdraggable?: boolean;
    serialNumber: boolean;
    isTree?: boolean;
    rowSelection?: boolean;
    /**单选多选 */
    rowSelectionType?: selectionTypeEnums;
  }>();

  const { datasource, cacheColumns } = toRefs(props);
  const emit = defineEmits([
    'getDataSource',
    'cellClickEvent',
    'nextPage',
    'radioEvent',
    'checkboxEvent',
    'onSelectChange',
    'onSelectAllChange',
  ]);
  const xTable = ref<VxeTableInstance>();
  let sortable: any = null;

  onMounted(async () => {
    if (props.rowdraggable) {
      const els = xTable.value?.$el.querySelector('.vxe-table--body tbody');
      sortable = new Sortable(els, {
        animation: 150,
        handle: '.mover',
        async onEnd({ newIndex, oldIndex }) {
          /**排序替换数据逻辑 */
          if (isNullAndUnDef(newIndex) || isNullAndUnDef(oldIndex) || newIndex === oldIndex) return;
          const [row] = datasource.value.splice(oldIndex, 1);
          datasource.value.splice(newIndex, 0, row);
          datasource.value = [...datasource.value];
        },
      });
    }
  });
  cacheColumns.value.forEach((i) => {
    initFieldWidgetRuntime(i)
      .then((fieldInfo) => {
        i.props.label = i.props.label || fieldInfo.name;
      })
      .catch((err) => {
        /**隐藏已经删除的字段 */
        i.props.hidden = true;
      });
    tableWidgetToShow(i, (f) => {
      i.props.hidden = f;
    });
  });
  const showColumns = computed(() => {
    const arr = cacheColumns.value.map((i) => {
      return { ...i, title: i.props.label, width: getColumnWidthByStyle(i.style) };
    });

    return arr;
  });
  onUnmounted(() => {
    sortable && sortable.destroy();
  });
  /**单选事件 */
  const radioChangeEvent: VxeTableEvents.RadioChange = ({ row }) => {
    emit('radioEvent', toRaw(row));
    emit('onSelectChange', { row: toRaw(row), checked: true });
  };
  /**复选事件 */
  const checkboxChangeEvent: VxeTableEvents.CheckboxChange = ({ row, checked }) => {
    emit('onSelectChange', { row: toRaw(row), checked });
    const $table = xTable.value;
    if ($table) {
      const records = $table.getCheckboxRecords();
      let rows = cloneDeep(records);
      emit('checkboxEvent', rows);
    }
  };
  /** 全选 */
  const selectAllChangeEvent: VxeTableEvents.CheckboxAll = ({ checked }) => {
    emit('onSelectAllChange', { checked });
    const $table = xTable.value;
    if ($table) {
      const records = $table.getCheckboxRecords();
      let rows = cloneDeep(records);
      emit('checkboxEvent', rows);
    }
  };
  /**单机cell事件 */
  const cellClickEvent: VxeTableEvents.CellClick = ({ row }) => {
    emit('cellClickEvent', toRaw(row));
  };

  /**
   * 计算宽度
   */
  function getColumnWidthByStyle(style) {
    return style.columnwidthConfigure === tableColumnWidthEnum.PERCENTAGE
      ? style.columnwidth + '%'
      : undefined;
  }

  function cellStyle({ row, column }) {
    if (!row._STYLE) return;
    const data = row._STYLE[column.field];
    return data;
  }

  let maxheight = 0;
  function scroll({ scrollHeight, scrollTop, bodyHeight }) {
    const total = scrollTop + bodyHeight + 2;
    if (total >= scrollHeight && maxheight < total) {
      maxheight = total;
      emit('nextPage');
    }
  }
  defineExpose({
    getXtable() {
      return xTable.value;
    },
  });
</script>
<style lang="less">
  .vxetable {
    --vxe-table-row-hover-radio-checked-background-color: #e6eeff;
    --vxe-table-row-radio-checked-background-color: #e6eeff;
    --vxe-table-row-checkbox-checked-background-color: #e6eeff;
    --vxe-table-row-hover-checkbox-checked-background-color: #e6eeff;
  }

  .vxetable {
    .gct-table-cell {
      padding: 0 !important;
      background-color: transparent !important;
    }
  }
</style>
