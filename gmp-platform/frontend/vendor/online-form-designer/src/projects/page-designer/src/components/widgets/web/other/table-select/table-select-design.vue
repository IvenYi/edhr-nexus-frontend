<template>
  <search-design
    v-if="widget.props.search"
    :widget="searchWidget"
    :class="[searchWidget.id === selectedWidget.id ? 'is-selected' : null]"
    @click.stop="setSelectedWidget(searchWidget, scope)"
  />
  <a-row :gutter="[12, 0]" v-if="widget.props.model && fieldList.length" class="mt16px">
    <a-col :span="rowSelectionType === RowSelectionTypeEnums.MultipleChoice ? 12 : 24">
      <div class="to-selected-box">
        <div class="table-wrap">
          <div class="text-[#000000] text-14px mb8px">
            <span class="title-icon mr12px"></span>
            {{ t('sys.pageDesigner.ToBeSelect') }}
          </div>
          <vxeDesignTable
            :datasource="[{ index: 1 }]"
            :columns="fieldList"
            :tableWidget="widget"
            :rowSelection="rowSelectionType === RowSelectionTypeEnums.MultipleChoice"
            :rowSelectionRadio="rowSelectionType === RowSelectionTypeEnums.SingleChoice"
            :serialNumber="serialNumber"
            :tableRowHeightNum="tableRowHeightNum"
            :cellHeaderHeightSync="widget.props.cellHeaderHeightSync"
            :border="false"
          />
        </div>
        <!-- <a-table
          size="middle"
          :data-source="leftData"
          :columns="columns"
          :row-selection="{}"
          bordered
          :scroll="{ x: 180 * columns.length, y: 300 }"
          :pagination="
            widget.props.showPagination
              ? {
                  pageSize: widget.props.pageSize,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  size: 'small',
                  pageSizeOptions: ['10', '20', '30', '40', '50'],
                }
              : false
          "
          style="min-height: 360px; background-color: #fff"
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.key === 'i'">
              {{ index + 1 }}
            </template>
          </template>
        </a-table> -->
      </div>
    </a-col>
    <a-col
      :span="12"
      class="be-selected-box-col"
      v-if="rowSelectionType === RowSelectionTypeEnums.MultipleChoice"
    >
      <div>
        <div class="table-wrap">
          <div class="text-[#000000] text-14px mb8px">
            <span class="title-icon mr12px"></span>
            {{ t('sys.pageDesigner.beSelected') }}
          </div>
          <vxeDesignTable
            :datasource="[{ index: 1 }]"
            :columns="fieldList"
            :tableWidget="{
              ...widget,
              props: {
                ...widget.props,
                showPagination: false,
              },
            }"
            :serialNumber="serialNumber"
            :tableRowHeightNum="tableRowHeightNum"
            :cellHeaderHeightSync="widget.props.cellHeaderHeightSync"
          >
            <!-- <template #operate>
              <a-button type="link" danger>{{ t('sys.delete') }}</a-button>
            </template> -->
          </vxeDesignTable>
        </div>
        <!-- <a-table
          bordered
          size="middle"
          :data-source="[leftData[0]]"
          :columns="[
            ...columns,
            { key: 'action', title: t('sys.operation'), align: 'center', width: 80 },
          ]"
          :pagination="false"
          :scroll="{ x: 200 * columns.length, y: 300 }"
          style="background-color: #fff"
          :style="{
            minHeight: widget.props.showPagination ? '416px' : '360px',
          }"
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.key === 'i'">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'action'">
              <a danger>{{ t('sys.delete') }}</a>
            </template>
          </template>
        </a-table> -->
      </div>
    </a-col>
  </a-row>
  <div
    class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed"
    v-else-if="widget.props.model"
  >
    <span class="text-[#c3c3c3] text-14px"> {{ t('sys.pageDesigner.selectModelFields') }}</span>
  </div>
  <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed" v-else>
    <span class="text-[#c3c3c3] text-14px"> {{ t('sys.pageDesigner.selectAssociatedModel') }}</span>
  </div>
</template>

<script setup lang="ts" name="gct-table-select">
  import { computed, inject, provide } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import SearchDesign from '/@page-designer/components/widgets/web/other/query/search-design.vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { SCOPE, RowSelectionTypeEnums } from '/@page-designer/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import vxeDesignTable from '/@page-designer/components/widgets/web/data/data-table/component/vxeDesignTable/index.vue';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const { t } = useI18n();
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const { setSelectedWidget, selectedWidget } = useSelectedWidget();
  const props = defineProps(widgetProps);
  provide('tableCellHeight', {
    cellHeightMode: props.widget.props.cellHeightMode,
    cellHeight: props.widget.props.cellHeight,
    cellHeaderHeightSync: props.widget.props.cellHeaderHeightSync,
  });
  const fieldList = computed(() => {
    return props.widget.children![1].children;
  });

  const searchWidget = computed(() => {
    return props.widget.children![0];
  });
  const rowSelectionType = computed(() => {
    return props.widget.props.rowSelectionType;
  });
  const serialNumber = computed(() => {
    return props.widget.props.index;
  });
  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });
</script>

<style lang="less" scoped>
  .be-selected-box-col::before {
    // content: '';
    // display: block;
    // position: absolute;
    // width: 1px;
    // height: 100%;
    // background-color: #eaeaea;
  }

  .tag {
    margin: 0;
    // margin-left: 12px;
    margin-bottom: 12px;
    border-radius: 0;
  }

  .is-selected {
    outline: var(--ant-primary-color) solid 1px;
  }

  :deep(.active) {
    background-color: rgb(13 170 156 / 10%);
  }

  :deep(.ant-pagination) {
    margin: 10px 0 0;
  }

  .table-select-wrap {
    // background-color: #fff;
  }

  .table-wrap {
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);
  }

  .title-icon {
    display: inline-block;
    position: relative;
    top: 1px;
    width: 2px;
    height: 12px;
    background-color: var(--ant-primary-color);
  }
</style>
