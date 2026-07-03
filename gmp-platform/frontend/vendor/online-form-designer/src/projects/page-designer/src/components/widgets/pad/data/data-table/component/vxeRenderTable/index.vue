<template>
  <vxe-grid
    class="vxetable"
    :column-config="{ minWidth: 100, useKey: true }"
    :row-config="{ isHover: true, useKey: true, keyField, isCurrent: true, ...rowConfig }"
    :edit-config="{
      trigger: 'manual',
      mode: 'row',
      showIcon: false,
      showAsterisk: false,
      enabled: isClickEdit,
      autoClear: true,
    }"
    min-height="88"
    :height="height"
    :max-height="maxHeight"
    ref="xTable"
    :data="propsDatasource"
    :loading="loading"
    :cell-style="cellStyle"
    :columns="showColumns"
    :auto-resize="autoResize"
    :seq-config="{ seqMethod }"
    :checkbox-config="{ highlight: true, ...checkboxConfig }"
    :radio-config="{ highlight: true, ...radioConfig }"
    @radio-change="radioChangeEvent"
    @cell-click="cellClickEvent"
    @checkbox-change="checkboxChangeEvent"
    @checkbox-all="selectAllChangeEvent"
    @edit-closed="saveTableRow"
    @scroll="scroll"
  >
    <template #radio="{ row, checked }">
      <van-radio icon-size="16px" shape="dot" :checked="checked" @click.stop="setRadioRow(row)" />
    </template>
    <template #header="{ column: { params: i } }">
      <div :class="[ns.b('column-label')]">
        <div :class="ns.be('column-label', 'label')">
          <span class="error-gct" v-show="i.props.required">*</span>
          {{ i.props.label }}
        </div>
      </div>
    </template>
    <template #default="{ column: { params: i }, row, rowIndex }">
      <slot name="field" v-bind="{ widget: i, row, rowIndex }">
        <div class="ks-row-middle" :key="rowIndex">
          <table-cell
            @saveTableRow="saveTableRow({ row, rowIndex })"
            class="ell w100%"
            :tableFieldId="tableFieldId"
            :widget="i"
            :rowValue="row"
            :index="rowIndex"
            :rowReadonly="isClickEdit || i.props.readonly || rowReadonly"
            :rowDisabled="rowDisabled" />
          <a
            class="iconfont icon-bianji ml5px"
            @click.stop="editRowEvent(row)"
            v-show="isClickEdit && !i.props.readonly"
          ></a
        ></div>
      </slot>
    </template>
    <template #default_deit="{ column: { params: i }, row, rowIndex }">
      <table-cell
        :tableFieldId="tableFieldId"
        :widget="i"
        :rowValue="row"
        :index="rowIndex"
        :key="rowIndex"
      />
    </template>
    <template #ope_default="{ row, rowIndex }" v-if="operateColumn">
      <slot name="operate" v-bind="{ row, rowIndex, operateColumn }">
        <RenderTableColunmButtons
          :tableForm="row"
          :buttons="operateColumn!.children"
          :visible-buttons="operateColumn!.props.visibleButtons"
          :rowIndex="rowIndex"
        />
      </slot>
    </template>
    <template #empty>
      <div class="h200px flex justify-center items-center flex-col">
        <img :src="simpleImage" />
        <div class="mt8px">暂无数据</div>
      </div>
    </template>
  </vxe-grid>
</template>

<script setup lang="ts">
  import { ref, nextTick, toRef, toRaw, onMounted, computed, onUnmounted, reactive } from 'vue';
  import { TableSearchTypeEnum, TableEditingMethodEnum } from '/@page-designer/enum';
  import { OperateTable } from '/@page-designer/types/web';
  import { VxeTableInstance, VxeTableEvents, VxeGrid } from 'vxe-table';
  import { columnsType } from '../../type';
  import { cloneDeep } from 'lodash-es';
  import { tableCell } from './table-component/index';
  import { getColumnOptions, useGetColumns } from './columnsOptions';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { TableTypeEnum, useNamespace } from '@gct/runtime';
  import { RenderTableColunmButtons } from '../render-table-buttons/render-table-column-buttons';
  // import { defaultValMap } from '/@page-designer/components/widgets/web/other/query/default-value';
  // import { useAppInfoStore } from '/@/store/modules/app-info';
  import simpleImage from '/@/assets/svg/pic_nodata.svg';

  const ns = useNamespace('vxe-design-table');

  const Event = getPageEvent();
  // const { appInfo } = useAppInfoStore();
  const props = withDefaults(
    defineProps<{
      tableFieldId?: string;
      /**数据源 */
      modelValue: { [key: string]: any }[];
      /**加载 */
      loading?: boolean;
      /** 表格高度自适应 */
      autoResize?: boolean;
      /** 是否多选*/
      rowSelection?: boolean;
      /**是否单选 */
      rowSelectionRadio?: boolean;
      /**显示操作 */
      showOperate?: boolean;
      /**操作配置 */
      operateColumn?: OperateTable;
      /**列配置 */
      tableColumns: columnsType;
      serialNumber?: boolean;
      radioDisabled?: boolean;
      searchType?: TableSearchTypeEnum;
      seqMethod?: ({ rowIndex }) => number;
      editMethods?: TableEditingMethodEnum;
      /**查询算子 */
      exp?: string;
      /** 自定义行数据唯一主键的字段名  默认 _X_ROW_KEY*/
      keyField?: string;
      isTree?: boolean;
      /**默认 字段都是只读*/
      rowReadonly?: boolean;
      /**默认 字段都是禁用*/
      rowDisabled?: boolean;
      /**按钮可见数量 */
      visibleButtons?: number;
      /**边框 */
      border?: boolean;
      /**最大高度 */
      maxHeight?: string;
      /**固定高度 */
      height?: string;
      customValidateRules?: Function;
      // 表格类型
      gridType?: TableTypeEnum;
      /**嵌套子表field */
      subModelField?: string;
      /**子表是否分页 */
      subTableShowPagination?: Boolean;
      /** 表格头部排序 */
      headerSort?: boolean;
      /**校验函数 */
      validateByIndex?: Function;
      dragOptions?: getColumnOptions;
      /**是否整行选中，单选或者多选的时候 点击行会自定选中 */
      selectTheEntireRow?: boolean;
      rowConfig?: any;
      checkboxConfig?: any;
      radioConfig?: any;
    }>(),
    {
      tableColumns: [],
      headerSort: true,
      autoResize: true,
      rowConfig: {},
      checkboxConfig: {},
      radioConfig: {},
    },
  );

  const emit = defineEmits([
    'getDataSource',
    'radioEvent',
    'checkboxEvent',
    'cellClickEvent',
    'update:modelValue',
    'updateRowForm',
    'onSelectChange',
    'onSelectAllChange',
    'nextPage',
  ]);

  const isClickEdit = computed(() => {
    return props.editMethods === TableEditingMethodEnum.CLICKTOENTEREDITING;
  });

  const propsDatasource = computed({
    get() {
      return props.modelValue;
    },
    set(data) {
      emit('update:modelValue', data);
    },
  });
  const xTable = ref<VxeTableInstance>();

  const showColumns = useGetColumns(props, props.dragOptions);

  /**触发编辑 */
  const editRowEvent = async (row) => {
    // if (tableError.value) return;
    // tableError.value = true;
    const $table = xTable.value;
    if ($table) {
      $table.setEditRow(row);
    }
  };

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
      emit('checkboxEvent', rows, toRaw(row));
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
  const cellClickEvent: VxeTableEvents.CellClick = ({ row, column }) => {
    if (column.id === 'operate') return;
    emit('cellClickEvent', row);
    if (props.selectTheEntireRow) {
      const $table = xTable.value;
      const checked = !$table!.isCheckedByCheckboxRow(row);
      if (props.rowSelection) {
        $table!.setCheckboxRow([row], checked);
        checkboxChangeEvent({ row, checked });
      }
      if (props.rowSelectionRadio) {
        setRadioRow(row);
      }
    }
  };
  function setRadioRow(row) {
    const $table = xTable.value;
    $table!.setRadioRow(row);
    radioChangeEvent({ row });
  }
  /**设置选中项 */
  async function setSeleckedByKeys(rowKey: string, keys: string[]) {
    await nextTick();
    const $table = xTable.value;
    if (!$table) return;
    const dataRows = keys.map((i) => {
      return propsDatasource.value.find((r) => r[rowKey] === i);
    });
    $table.clearCheckboxRow();
    $table.setCheckboxRow(dataRows, true);
  }

  function cellStyle({ row, column }) {
    if (!row._STYLE) return;
    const data = row._STYLE[column.field];
    return data;
  }
  /**关闭编辑状态 */
  async function saveTableRow({ row, rowIndex }) {
    emit('updateRowForm', { row, rowIndex });
  }

  let maxheight = 0;
  let lastScrollLeft = 0;
  function scroll({ scrollHeight, scrollTop, bodyHeight, scrollLeft }) {
    if (scrollLeft !== lastScrollLeft) {
      lastScrollLeft = scrollLeft;
      return;
    }
    const total = scrollTop + bodyHeight + 2;
    if (total >= scrollHeight && maxheight < total) {
      maxheight = total;
      emit('nextPage');
    }
  }
  defineExpose({
    setSeleckedByKeys,
    getXtable() {
      return xTable.value;
    },
  });
</script>
<style lang="less">
  .gct-vxe-design-table-column-label {
    display: inline-flex;
    width: 100%;
    // padding: 4px 0;
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
    --vxe-table-row-hover-radio-checked-background-color: hsl(
      from var(--ant-primary-color) h s 94%
    );
    --vxe-table-row-radio-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
    --vxe-table-row-checkbox-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
    --vxe-table-row-hover-checkbox-checked-background-color: hsl(
      from var(--ant-primary-color) h s 94%
    );
    --vxe-table-row-current-background-color: hsl(from var(--ant-primary-color) h s 94%);
    --vxe-table-row-hover-current-background-color: hsl(from var(--ant-primary-color) h s 94%);
    --vxe-table-header-background-color: #f6f8faff;

    .vxe-cell {
      overflow: hidden;

      .table-actionItem {
        .ant-btn-link {
          padding: 0;
        }
      }
    }

    .gct-table-cell {
      padding: 0 !important;
      background-color: transparent !important;
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

  .top-box-shadow,
  .bottom-box-shadow {
    position: absolute;
    z-index: 10;
    right: 0;
    left: 0;
    height: 1px;
  }

  .top-box-shadow {
    top: 0;
    box-shadow: 0 1px 4px 0 rgb(0 0 0 / 12%);
  }

  .bottom-box-shadow {
    bottom: 0;
    box-shadow: 0 -1px 6px 0 rgb(0 0 0 / 12%);
  }

  .gct-expand {
    .vxe-cell {
      text-overflow: unset !important;
    }
  }

  // .vxetable {
  //   --vxe-table-row-hover-radio-checked-background-color: #e6eeff;
  //   --vxe-table-row-radio-checked-background-color: #e6eeff;
  //   --vxe-table-row-checkbox-checked-background-color: #e6eeff;
  //   --vxe-table-row-hover-checkbox-checked-background-color: #e6eeff;
  // }
  .vxe-table--render-default .vxe-cell--checkbox.is--checked .vxe-checkbox--icon,
  .vxe-table--render-default .vxe-cell--checkbox.is--indeterminate .vxe-checkbox--icon {
    color: var(--van-primary-color);
  }
</style>
