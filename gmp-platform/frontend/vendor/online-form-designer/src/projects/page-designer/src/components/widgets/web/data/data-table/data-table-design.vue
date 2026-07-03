<template>
  <div
    style="width: 100%"
    :class="{
      'bg-[#fff]': true,
      'data-table-render': true,
      [gridType]: true,
      'is-enable-select': rowSelection,
    }"
    class="rounded-4px"
  >
    <div
      class="table-header-container"
      :class="gridType === TableTypeEnum.SUB ? 'pl12px pr12px' : null"
      v-if="
        fullScreen ||
        currentReload ||
        customHeader ||
        productionScheduling ||
        (productionScheduling && doNotSubmit === true) ||
        (rowSelection && selects.length) ||
        batchBtnGroup ||
        headerBtnGroup
      "
    >
      <div class="pitch-on">
        <div v-if="rowSelection && selects.length > 0">
          <span>
            {{ $t('sys.pageDesigner.selected') }}
            <span class="pitch-on-count">{{ 1 }}</span>
            {{ $t('sys.pageDesigner.row') }}
          </span>
          <span class="pitch-on-clear" :title="$t('sys.pageDesigner.clearSelectedData')">
            <i class="iconfont icon-tianjia"></i>
          </span>
        </div>
        <div v-if="batchBtnGroup && rowSelection && selects.length > 0" class="batch-btn-group">
          <DesignTableButtons
            :parentWidget="widget"
            :visible-buttons="batchBtnGroup?.visibleButtons"
            :buttons="batchBtnGroup?.children"
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
        <div
          class="ks-row-middle p10px"
          v-if="
            fullScreen ||
            currentReload ||
            customHeader ||
            (productionScheduling && doNotSubmit === true)
          "
        >
          <div class="ks-col"></div>
          <a-button v-show="productionScheduling && doNotSubmit === true">
            <template #icon> <i class="iconfont icon-paixu"></i></template>
          </a-button>
          <a-button v-show="fullScreen" class="ml10px">
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
      :serialNumber="serialNumber"
      :rowSelection="rowSelection"
      :rowSelectionRadio="rowSelectionRadio"
      :datasource="datasource"
      :columns="tableColumns"
      :rowdraggable="rowdraggable"
      :operateColumn="operateColumn"
      :tableWidget="widget"
      :editMethods="editMethods"
      :gridType="gridType"
      :enableEmbed="!!subTableWidget"
      @checkboxEvent="checkboxEvent"
      @radioEvent="radioEvent"
      :levelHeaderGrouping="widget.props.levelHeaderGrouping"
      :multiLevelHeader="widget.props.multiLevelHeader"
      :tableRowHeightNum="tableRowHeightNum"
      :cellHeaderHeightSync="widget.props.cellHeaderHeightSync"
      v-if="tableColumns.length"
      :height="height"
      ref="tableRef"
      :isDesign="true"
    >
      <template #embed v-if="subTableWidget">
        <widget-wrapper
          :key="subTableWidget.id"
          :widget="subTableWidget"
          :parentWidget="widget"
          :action="subTableAction"
        >
          <data-table-design :widget="subTableWidget" />
        </widget-wrapper>
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

<script setup lang="ts" name="gct-data-table">
  import {
    toRefs,
    toRef,
    inject,
    ref,
    withDefaults,
    onUnmounted,
    computed,
    provide,
    reactive,
  } from 'vue';
  import { DataTable } from '/@page-designer/types/web';
  import { vxeRefTable, useTableLayout } from '../data-table/component/vxeDesignTable';
  import { isEmpty } from 'lodash-es';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useSelectedWidget } from '/@/projects/page-designer/src/hooks/useSelectedWidget';
  import { SCOPE } from '/@/projects/page-designer/src/enum';
  import { DesignTableButtons } from './component/design-table-buttons/design-table-buttons';
  import { selectionTypeEnums, TableTypeEnum, TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';
  import { transformButtons } from './component/transform';
  import { FormComponents } from '/@page-designer/enum';
  import { createUUID } from 'qx-util';
  import { createRadioSelectManager } from './use';

  const { setSelectedWidget } = useSelectedWidget();

  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const props = withDefaults(defineProps<{ widget: DataTable; sessionId: string }>(), {
    sessionId: createUUID(),
  });

  const tableRef = ref();

  const tableId = createUUID();

  // 单选模式下的管理器，只有父子均开启单选模式时才生效
  const radioSelectManage = createRadioSelectManager(props.sessionId);
  // 注册当前表格的选中清空方法
  radioSelectManage.setRegisterTableClear(tableId, () => {
    if (tableRef.value) {
      tableRef.value.getXtable().clearRadioRow();
    }
  });
  onUnmounted(() => {
    // 组件卸载时，删除注册
    radioSelectManage.removeRegisterTableClear(tableId);
  });

  const selects = ref<any[]>([]);

  const {
    fullScreen,
    currentReload,
    customHeader,
    productionScheduling,
    model,
    rowdraggable,
    serialNumber,
    editMethods,
    doNotSubmit,
    gridType,
    cellHeightMode,
    cellHeight,
  } = toRefs(props.widget.props);
  const { height } = useTableLayout(props.widget);
  const tableCellHeight = reactive({
    cellHeightMode: cellHeightMode?.value,
    cellHeight: cellHeight?.value,
  });
  provide('tableCellHeight', tableCellHeight);

  const rowSelectionType = toRef(() => props.widget.props.rowSelectionType);
  const rowSelection = toRef(() => {
    if (props.widget.props.rowSelection) return true;
    return rowSelectionType?.value === selectionTypeEnums.MultipleChoice;
  });
  const rowSelectionRadio = toRef(
    () => rowSelectionType?.value === selectionTypeEnums.SingleChoice,
  );
  if (!props.widget.children![2]) {
    // eslint-disable-next-line vue/no-mutating-props
    props.widget.children[2] = {
      alias: '头部按钮',
      preLocation: props.widget.id,
      props: {
        visibleButtons: 5,
      },
      children: [],
    };
    // eslint-disable-next-line vue/no-mutating-props
    props.widget.children[2] = {
      alias: '批量按钮',
      preLocation: props.widget.id,
      props: {
        visibleButtons: 5,
      },
      children: [],
    };
  }

  const tableColumns = toRef(() => {
    return props.widget.children![1].children;
  });

  const operateColumn = toRef(() => {
    if (props.widget.children![0]?.children?.length) {
      return props.widget.children![0];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
  }
  if (props.widget.children![0]?.id) {
    props.widget.children[0].id = undefined;
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
  const subTableWidget = toRef(() => {
    const data = props.widget.children![4];
    if (data && !isEmpty(data) && data.type === FormComponents.SubDataTable) {
      return data;
    }
  });

  const subTableAction = (tag) => {
    if (tag === 'deleteWidget') {
      setSelectedWidget(props.widget, scope);
      props.widget.props.subModel = null;
      props.widget.props.subModelField = null;
      props.widget.props.subModelData = {};
      props.widget.children[4] = {};
      return true;
    }
    return false;
  };

  const checkboxEvent = (rows) => {
    selects.value = rows;
  };

  function radioEvent(value) {
    radioSelectManage.clearRadioSelect(tableId);
  }

  //TODO目前只查实体模型 等有虚拟模型再改动
  // rowSelectionType.value
  const datasource = [{ index: 1 }];

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });
</script>
<style scoped lang="scss">
  .data-table-render.embed.is-enable-select {
    .data-table-render.sub {
      .table-header-container {
        margin-left: 48px;
        border-left: 1px solid #e8ebf0;
      }
    }

    .vxe-grid.vxetable.sub {
      margin-left: 48px;
    }
  }

  .data-table-render.sub {
    background-color: #f9fafb;

    .table-header-container {
      margin-left: 16px;
      border-left: 1px solid #e8ebf0;
    }
  }

  .table-header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .batch-btn-group {
    display: flex;
    margin-left: 16px;
    gap: 8px;
  }

  .header-btn-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pitch-on {
    display: inline-flex;
    align-items: center;
    height: 100%;
    float: left;
    font-size: 14px;
    cursor: pointer;
  }

  .table-header-right {
    display: inline-flex;
    align-items: center;
    height: 100%;
    float: right;
  }

  .pitch-on-count {
    color: #3168ec;
  }

  .pitch-on-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    transform: rotate(45deg);
    border-radius: 9px;
    background-color: #e6e9ef;

    .iconfont {
      color: #797a7d;
      font-size: 12px;
    }
  }
</style>
