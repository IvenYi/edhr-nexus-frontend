<template>
  <vxe-grid
    :class="{
      vxetable: true,
      'vxe-table--embedded': searchType === TableSearchTypeEnum.EMBEDDED,
      [gridType]: true,
      'row-height-one': tableRowHeightNum === 1,
      'row-height-custom': tableRowHeightNum > 1,
      'row-height-auto': tableRowHeightNum < 0,
      'header-height-sync': cellHeaderHeightSync,
    }"
    :show-overflow="tableRowHeightNum == 1 && propsDatasource.length > 30"
    :show-header-overflow="tableRowHeightNum == 1"
    :style="tableRowHeightNum > 0 ? { '--table-cell-line-clamp': tableRowHeightNum } : undefined"
    :column-config="{ minWidth: 100, useKey: true }"
    :row-config="{
      isHover: true,
      useKey: true,
      keyField,
      isCurrent: true,
      ...rowConfig,
    }"
    :edit-config="{
      trigger: 'manual',
      mode: 'row',
      showIcon: false,
      showAsterisk: false,
      enabled: isClickEdit,
      autoClear: true,
      beforeClearEdit: beforeClearEdit,
    }"
    :scroll-y="{ enabled: tableRowHeightNum == 1, scrollToTopOnChange: true, oSize: 5, gt: 30 }"
    min-height="96"
    :height="height"
    :max-height="maxHeight"
    ref="xTable"
    :data="propsDatasource"
    :loading="loading"
    :loading-config="{
      text: $t('sys.loadingText'),
    }"
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
    :border="multiLevelHeader"
  >
    <template #groupHeader="{ column }">
      <div class="pt12px pb12px pl6px pr6px text-center"> {{ column.title }} </div>
    </template>
    <template #radio="{ row, checked }">
      <a-radio :checked="checked" @click.stop="setRadioRow(row)" class="m0!" />
    </template>
    <template #header="{ column: { params: i, treeNode } }">
      <searchWidget
        class="mb10px"
        :columnWidget="i"
        @search="search"
        :queryData="querySearchData"
        v-if="searchType === TableSearchTypeEnum.EMBEDDED"
      />
      <div
        :class="[
          ns.b('column-label'),
          ns.is(
            'enable-sort',
            headerSort == true &&
              i.props.isCustomField !== true &&
              isSortFiled(i.props.fieldType) &&
              (!isTree || treeNode),
          ),
          ns.is('top-sort', activeSort === `${i.props.field}:up:${i.id}`),
          ns.is('down-sort', activeSort === `${i.props.field}:down:${i.id}`),
        ]"
        @click="
          (e) => {
            if (
              headerSort == true &&
              i.props.isCustomField !== true &&
              isSortFiled(i.props.fieldType) &&
              (!isTree || treeNode)
            ) {
              sortClick(e, i);
            }
          }
        "
      >
        <div :class="ns.be('column-label', 'label')" v-ellipsis-title="i.props.label || ''">
          <span class="error-gct" v-show="i.props.required">*</span>
          {{ i.props.label }}
          <a-tooltip v-if="!!i.props.showExplain">
            <template #title> {{ i.props.explain }}</template>
            <info-circle-outlined class="explain-icon ml5px" />
          </a-tooltip>
        </div>
        <div :class="ns.be('column-label', 'sort-icon')">
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
    </template>
    <template #default="{ column: { params: i }, row, rowIndex }">
      <slot name="field" v-bind="{ widget: i, row, rowIndex }">
        <div class="flex justify-around w100%" :key="rowIndex">
          <div
            class="ks-row items-center w100% h100%"
            :style="{
              width: isClickEdit && !i.props.readonly ? 'calc(100% - 22px)' : '100%',
              justifyContent: transformFont2flexStyle(i),
            }"
            :class="{
              'overflow-hidden': isClickEdit || i.props.readonly || rowReadonly,
              py9px: i.props.readonly || rowReadonly,
            }"
          >
            <table-cell
              @saveTableRow="saveTableRow({ row, rowIndex })"
              class="min-w-16px table-render-cell h100%"
              :class="{
                'line-clamp': isClickEdit || i.props.readonly || rowReadonly,
                ell:
                  (props.tableRowHeightNum === 1 || !props.tableRowHeightNum) &&
                  (isClickEdit || i.props.readonly || rowReadonly),
              }"
              :tableFieldId="tableFieldId"
              :widget="i"
              :rowValue="row"
              :index="rowIndex"
              :getPopupContainer="getPopupContainer"
              :rowReadonly="isClickEdit || i.props.readonly || rowReadonly"
              :getValidRules="getValidRules"
              :rowDisabled="rowDisabled"
              v-ellipsis-title="
                row._OPCT?._DICT?.[i.props.bindFieldLink?.join('.')]?.[
                  row._OPCT[i.props.bindFieldLink?.join('.')]
                ] ||
                row._DICT?.[i.props.field]?.[row[i.props.field]] ||
                row[i.props.field]
              "
            />
            <MultiFieldDisplay
              :widget="i"
              :rowValue="row"
              :rowReadonly="isClickEdit || i.props.readonly || rowReadonly"
              :isDesign="props.isDesign"
            />
          </div>

          <a
            class="iconfont icon-bianji ml5px pt8px"
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
        :getValidRules="getValidRules"
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
    <template #pager>
      <slot name="pager"></slot>
    </template>
    <template #content="{ row }">
      <div class="top-box-shadow"></div>
      <slot name="embed" :row="row"></slot>

      <div class="bottom-box-shadow"></div>
    </template>
    <template #empty>
      <a-empty :image="simpleImage" :description="emptyText || $t('sys.noData')" />
    </template>
  </vxe-grid>
</template>

<script setup lang="ts">
  import {
    ref,
    nextTick,
    toRef,
    toRaw,
    onMounted,
    computed,
    onUnmounted,
    reactive,
    inject,
  } from 'vue';
  import { TableSearchTypeEnum, TableEditingMethodEnum } from '/@page-designer/enum';
  import { OperateTable } from '/@page-designer/types/web';
  import { VxeTableInstance, VxeTableEvents } from 'vxe-table';
  import { columnsType } from '../../type';
  import { cloneDeep } from 'lodash-es';
  import { tableCell, searchWidget } from './table-component/index';
  import { getColumnOptions, useGetColumns } from './columnsOptions';
  import { isSortFiled } from '/@page-designer/utils';
  import { useGetBodyBySearch, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useValidator } from '/@page-designer/hooks/useValidator';
  import { validateRule } from '/@page-designer/types/widget-basic-types';
  import { getScrollParent } from '/@page-designer/components/widgets/hooks/listhook';
  import { TABLE_CELL_HEIGHT_MODE, TableTypeEnum, useNamespace } from '@gct/runtime';
  import { RenderTableColunmButtons } from '../render-table-buttons/render-table-column-buttons';
  import { Empty } from 'ant-design-vue';
  import { defaultValMap } from '/@page-designer/components/widgets/web/other/query/default-value';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import MultiFieldDisplay from '../../../../__components__/formcomponent/field-label/muti-field-display.vue';
  import { transformFont2flexStyle } from '../transform';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const ns = useNamespace('vxe-design-table');
  const tableCellHeight = inject('tableCellHeight');

  const Event = getPageEvent();
  const { appInfo } = useAppInfoStore();
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
      /** 行拖拽排序 */
      rowDragSort?: boolean;
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
      /**自定义校验 */
      validateRule?: validateRule[];
      customValidateRules?: Function;
      // 表格类型
      gridType?: TableTypeEnum;
      /**嵌套子表field */
      subModelField?: string;
      /**子表是否分页 */
      subTableShowPagination?: Boolean;
      /** 表格头部排序 */
      headerSort?: boolean;
      /**编辑关闭前校验函数 */
      beforeClearEdit?: Function;
      /**校验函数 */
      validateByIndex?: Function;
      dragOptions?: getColumnOptions;
      /**是否整行选中，单选或者多选的时候 点击行会自定选中 */
      selectTheEntireRow?: boolean;
      /**是否开启多级表头 */
      multiLevelHeader?: boolean;
      /**多级表头数组 key,title */
      levelHeaderGrouping?: any[];

      rowConfig?: any;
      checkboxConfig?: any;

      radioConfig?: any;
      isDesign?: boolean;
      emptyText?: string;
      /** 表格单行显示文字行数，-1 表示不限制, 正数表示限制行数 */
      tableRowHeightNum?: number;
      /** 表头行高是否同步单元格行高模式 */
      cellHeaderHeightSync?: boolean;
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
  /**编辑事件拦截 */
  // VXETable.interceptor.add('event.clearEdit', (row) => {
  //   console.log(row);
  // });

  const emit = defineEmits([
    'getDataSource',
    'radioEvent',
    'checkboxEvent',
    'cellClickEvent',
    'update:modelValue',
    'updateRowForm',
    'onSelectChange',
    'onSelectAllChange',
    'titleSort',
  ]);

  const activeSort = ref<string>('');

  const sortClick = (e: MouseEvent, item) => {
    if (props.headerSort === true) {
      e.stopPropagation();
      const upKey = `${item.props.field}:up:${item.id}`;
      const downKey = `${item.props.field}:down:${item.id}`;
      if (activeSort.value === downKey) {
        activeSort.value = '';
      } else if (activeSort.value === upKey) {
        activeSort.value = downKey;
      } else {
        activeSort.value = upKey;
      }
      const [key, sort] = activeSort.value.split(':');
      const fieldLinks = item.props.bindFieldLink || [];
      const sortData = {
        sortField: fieldLinks.length > 0 ? fieldLinks.join('.') : key,
        sortType: !key ? '' : sort === 'up' ? 'asc' : 'desc',
      };
      emit('titleSort', sortData);
    }
  };

  const querySearchData = reactive({});

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
  const getPopupContainer = () => getScrollParent(xTable.value?.$el);
  // let sortable: any = null;

  let treeNodeObserver: MutationObserver | null = null;
  let adjustPending = false;

  /** 将 .vxe-tree--line 元素的 left 样式减少 20px，从而隐藏根节点连接线 */
  function adjustTreeNodeIndent() {
    const $el = xTable.value?.$el;
    if (!$el) return;
    const treeNodes = $el.querySelectorAll('.vxe-tree--line');
    treeNodes.forEach((node) => {
      const currentLeft = node.style.left;
      // 跳过已调整到当前值的元素，避免重复处理
      if (node.dataset.adjustedLeft === currentLeft) return;
      const leftValue = parseFloat(currentLeft) || 0;
      const adjustedLeft = `${Math.max(0, leftValue - 21)}px`;
      node.dataset.adjustedLeft = adjustedLeft;
      node.style.left = adjustedLeft;
    });
  }

  /** 使用 requestAnimationFrame 节流，避免频繁 DOM 操作 */
  function scheduleAdjustTreeNodeIndent() {
    if (adjustPending) return;
    adjustPending = true;
    requestAnimationFrame(() => {
      adjustTreeNodeIndent();
      adjustPending = false;
    });
  }

  onMounted(async () => {
    if (props.searchType === TableSearchTypeEnum.EMBEDDED) {
      await nextTick();
      await search();
    }
    // 树形表格节点缩进调整：监听 DOM 变化以处理虚拟滚动和展开/折叠
    if (props.isTree) {
      await nextTick();
      const $el = xTable.value?.$el;
      if ($el) {
        adjustTreeNodeIndent();
        treeNodeObserver = new MutationObserver(scheduleAdjustTreeNodeIndent);
        treeNodeObserver.observe($el, { childList: true, subtree: true });
      }
    }
  });
  onUnmounted(() => {
    if (treeNodeObserver) {
      treeNodeObserver.disconnect();
      treeNodeObserver = null;
    }
  });

  const showColumns = useGetColumns(props, props.dragOptions);
  console.log('showColumns', showColumns);

  function getValidRules(widget, formData: object) {
    if (!props.subTableShowPagination && widget?.isField && !widget.props.readonly) {
      const { rules } = useValidator({
        type: widget.type,
        widgetProps: widget.props,
        formData,
        subTableCustomValidateRules: props.customValidateRules,
        validateRules: props.validateRule,
        Event,
      });
      return rules.value;
    }
  }
  const searchWigets = toRef(() => {
    const list = [];
    props.tableColumns.forEach((i) => {
      const w = i.children?.[0];
      w && i.props.embeddedSearch && list.push(toRaw(w));
    });
    return list;
  });
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
    const isEditing = xTable.value?.isEditByRow(row);
    if (column.editRender?.enabled && isEditing) return;
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
  let pro: Promise<void> | null = null;
  async function initDefaultValue(): Promise<void> {
    const children = props.tableColumns;

    if (props.searchType === TableSearchTypeEnum.EMBEDDED && children) {
      const all = children
        .filter((_) => {
          return (
            (_.children?.[0].props.defaultValueType != null &&
              _.children?.[0].props.defaultValueType !== '') ||
            (_.children?.[0].props.defaultValue != null &&
              _.children?.[0].props.defaultValue !== '')
          );
        })
        .map(async (_) => {
          const { fieldType } = _.children[0].props;
          const fn = defaultValMap.get(fieldType);

          if (fn) {
            const val = await fn(_.children[0], { appInfo });
            if (val != null && querySearchData[_.children[0].id] == null) {
              querySearchData[_.children[0].id] = val;
            }
          }
        });
      await Promise.all(all);
    }
    pro = null;
  }

  pro = initDefaultValue();

  async function search() {
    if (pro) {
      await pro;
    }
    try {
      let { query, exp } = await useGetBodyBySearch(
        toRaw(querySearchData),
        searchWigets.value,
        props.exp,
      );
      const params: any = {
        query,
        exp,
        pageNo: 1,
      };
      emit('getDataSource', params);
    } catch (error) {
      console.log(error);
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

    .vxe-table--filter-option .vxe-checkbox--icon,
    .vxe-checkbox .vxe-checkbox--icon,
    .vxe-export--panel-column-option .vxe-checkbox--icon,
    .vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--icon,
    .vxe-custom--checkbox-option .vxe-checkbox--icon {
      font-weight: 100;
    }

    .vxe-cell {
      height: v-bind("tableRowHeightNum === 1?'auto':'100%'");
      overflow: visible;

      .gct-table-actionItem {
        height: auto;
      }

      .table-actionItem {
        .ant-btn-link {
          padding: 0;
        }
      }
    }

    .col--edit,
    .col--radio,
    .col--checkbox {
      .vxe-cell {
        display: flex;
      }
    }
    // .col--tree-node {
    //   .vxe-cell {
    //     .vxe-tree-cell {
    //       padding-top: 11px;
    //       padding-bottom: 11px;
    //     }
    //   }
    // }
    .col--edit {
      .vxe-cell {
        width: 100%;
        height: 100%;
        // height: v-bind("(tableRowHeightNum === 1||!tableRowHeightNum)?'auto':'100%'");
        padding: 6px 12px;
        // padding: 0 12px;
        overflow: visible !important;
        .vxe-cell--tree-node,
        .vxe-tree-cell {
          width: 100%;
        }
        .vxe-tree-cell {
          // padding-top: 5px;
        }
        > div {
          height: 100%;
        }
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
    }

    .vxe-body--column.col--seq,
    .vxe-body--column.operate,
    .vxe-body--column.col--expand {
      .vxe-cell {
        line-height: 48px;

        .gct-table-actionItem {
          height: 48px;
        }
      }
    }

    .vxe-body--column.col--radio,
    .vxe-body--column.col--checkbox {
      .vxe-cell {
        > label {
          display: flex;
          align-items: center;
          height: 48px;
        }

        .vxe-cell--checkbox {
          display: flex;
          align-items: center;
          height: 48px;
        }
      }
    }

    .vxe-tree--line {
      border-bottom: 0;
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

  .table-render-cell:has(div.ant-progress),
  .table-render-cell:has(div.line-process) {
    width: 100%;
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
      -webkit-line-clamp: var(--table-cell-line-clamp);
      white-space: normal;
    }
  }

  .line-clamp {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-line-clamp: var(--table-cell-line-clamp); /* 显示几行就改几 */
    -webkit-box-orient: vertical;
    // white-space: normal;
  }
</style>
<style lang="less" scoped>
  .vxetable {
    .table-form-item {
      :deep(.ant-select) {
        height: 36px;

        .ant-select-selector {
          height: 100%;
        }
      }

      .multiple {
        height: 100% !important;
      }
      :deep(.ant-select-selection-overflow) {
        padding-top: 5px;
      }

      :deep(.ant-select-selection-overflow-item) {
        min-height: 26px;
      }

      :deep(.ant-select-single .ant-select-selector .ant-select-selection-item),
      :deep(.ant-select-single .ant-select-selector .ant-select-selection-placeholder) {
        line-height: 34px;
      }
    }
  }
</style>
