<template>
  <vxe-grid
    :border="true"
    v-bind="gridOptions"
    ref="vxeTable"
    :maxHeight="maxHeight"
    :loading="loading"
    :sort-config="{
      multiple: false,
      remote: true,
      trigger: 'cell',
    }"
    :export-config="exportConfig"
    @sort-change="sortChangeEvent"
    :class="{ 'vxe-nobody': only_col, 'gct-report-fixed': reportFixed }"
    :style="{ '--line-clamp': lineClamp, '--link-color': linkColor }"
  >
    <template #top>
      <div class="mb16px" v-if="isDesign">
        <span class="preview">{{ $t('sys.report.resultPreview') }}</span>
      </div>
      <div v-if="showHeader" class="pb16px ks-row text-right leading-none">
        <crumbs :links="drillingLinkList" :crumbsClick="crumbsClick" />
        <div class="ks-col">
          <Filter
            v-if="filter"
            :column="columns"
            :modelKey="modelKey"
            @filter="filterChange"
            class="highlight"
            :categorySelect="categorySelect"
          />
          <fieldSort
            @reloadColumn="reloadTableColumn"
            class="ml-16px"
            v-if="customHeader"
            :reportSchema="widget"
          />
          <FullScreen v-if="fullScreen && vxeTable" class="ml-16px highlight" :el="vxeTable">
            <span class="pl6px text-14px">{{ $t('sys.pageDesigner.fullScreen') }}</span>
          </FullScreen>
          <ExportBtn
            class="ml-16px highlight"
            @reload="reloadTable"
            @exportExcel="exportExcel"
            :reportName="props.widget?.reportName"
            :reportType="$t('sys.report.crosstabs')"
            :exportTable="exportTable"
          />
        </div>
      </div>
      <div v-else class="h30px"> </div>
    </template>
    <template #header="{ column }">
      <headerRender :value="column.params?.displayTitle || column.title" :widget="column.params" />
    </template>
    <template #default="{ column, row, $columnIndex }">
      <fieldRender
        :row="row"
        :widget="column.params"
        :fieldKey="column.field"
        :columnIndex="$columnIndex"
      />
    </template>
    <template #footer="{ column, $columnIndex }">
      <footerRender
        v-if="serialNumber"
        :key="column.field"
        :value="listStatisticData[column.field]"
        :totalData="listStatisticData"
        :params="column.params"
      />
      <div v-else-if="showTotalRow">
        <div class="row-total-text ell h-22px">
          {{ !$columnIndex ? calculationMethod?.totalAlias : '' }}
        </div>
        <footerRender
          :value="listStatisticData[column.field]"
          :totalData="listStatisticData"
          :params="column.params"
        />
      </div>
      <div v-else>
        <div class="ell" v-if="!$columnIndex && listStatisticData[column.field] === undefined">{{
          calculationMethod?.totalAlias
        }}</div>
        <footerRender
          :value="listStatisticData[column.field]"
          :totalData="listStatisticData"
          :params="column.params"
          v-else
        />
      </div>
    </template>
    <template #pager>
      <div v-if="pager && !only_col" class="text-right mt16px">
        <a-pagination
          v-bind="paginationAttr"
          v-model:current="pagination.pageNo"
          v-model:pageSize="pagination.pageSize"
          :total="total"
          @change="changePage"
        />
      </div>
    </template>
  </vxe-grid>
</template>

<script setup lang="ts">
  import { ref, defineComponent, PropType, computed, toRefs } from 'vue';
  import { useCrossTable } from './hook-cross';
  import { ReportTable, BaseField } from '../../schema/index';
  import { useReportRender } from './field-render';
  import Filter from './components/filter-btn.vue';
  import fieldSort from './components/field-sort.vue';
  import FullScreen from '/@/components/FullScreen/index.vue';
  import type { LinkItem } from './drilling-hook';
  import crumbs from './components/crumbs.vue';
  import { ExportBtn, useExportReportData } from './components/report-export';
  import { useWatchReportFixed } from './report-hooks';
  import { message } from 'ant-design-vue';

  const props = defineProps({
    widget: ReportTable,
    parentRef: HTMLElement,
    isDesign: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    drillingClick: Function,
    crumbsClick: Function,
    drillingLinkList: {
      type: Object as PropType<LinkItem[]>,
      default: () => [],
    },
  });
  const { fullScreen, filter, exportTable } = toRefs(props.widget!);
  const {
    calculationMethod,
    serialNumber,
    modelKey,
    pager,
    rowDimension,
    columnDimension,
    sorts,
    fieldMap,
    categorySelect,
    customHeader,
  } = props.widget!;
  const vxeTable = ref();
  const { reportFixed } = useWatchReportFixed(props.widget, { vxeTable });

  const { exportConfig, exportData } = useExportReportData({ vxeTable });
  const {
    fieldRender,
    transformValue,
    footerRender,
    lineClamp,
    linkColor,
    renderTotal,
    transformValueByField,
  } = useReportRender(props.widget!, {
    vxeTable,
    drillingClick: props.drillingClick,
    drillingLinkList: props.drillingLinkList,
  });
  const {
    gridOptions,
    pagination,
    total,
    search,
    reload,
    listStatisticData,
    maxHeight,
    loading,
    only_col,
    firstField,
    reloadTableColumn,
    getExportDataByHttp,
  } = useCrossTable(props.widget!, {
    vxeTable,
    parentRef: props.parentRef,
    drillingLinkList: props.drillingLinkList,
    renderTotal,
    transformValueByField,
  });
  /** 行维度和列维度总和 */
  const columns = computed(() => {
    return rowDimension
      .map((i) => {
        return {
          title: fieldMap[i].fieldName,
          params: {
            fieldType: fieldMap[i].fieldType,
            field: i.replace('dimension:', ''),
          },
        };
      })
      .concat(
        columnDimension.map((i) => {
          return {
            title: fieldMap[i].fieldName,
            params: {
              fieldType: fieldMap[i].fieldType,
              field: i.replace('dimension:', ''),
            },
          };
        }),
      );
  });
  const headerRender = defineComponent(
    (props: { value: string; widget: BaseField }) => {
      const { widget, value } = props;
      return () => transformValue(value, widget, true);
    },
    {
      props: ['widget', 'value'],
    },
  );
  /**第一行是否被总计占位 */
  const showTotalRow = computed(
    () => firstField.value && listStatisticData.value[firstField.value] !== undefined,
  );

  const paginationAttr = {
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20, 30, 40, 50].map((i) => i + ''),
    showTotal: (total) => window.$t('sys.report.totalCount', { count: total }),
  };
  function changePage(pageNo, pageSize) {
    reload();
  }

  function sortChangeEvent({ sortList }) {
    pagination.sorts = sorts;
    if (sortList.length) {
      pagination.sorts = sortList.map((i) => {
        return {
          sortField: i.field,
          sortType: i.order,
        };
      });
    }
    reload();
  }

  function filterChange(query, exp) {
    search({
      query,
      exp,
    });
  }

  async function exportExcel(arg) {
    const data = await getExportDataByHttp(arg);
    exportData({ data, ...arg, columns });
  }
  async function reloadTable() {
    await reload();
    message.success($t('sys.reloadSuccess'));
  }
  defineExpose({});
</script>
<style scoped lang="scss">
  :deep(.vxe-table .vxe-cell--sort-vertical-layout) {
    height: 1.2em;
  }

  :deep(.vxe-table .vxe-sort--asc-btn.sort--active) {
    color: var(--ant-primary-color);
  }

  :deep(.vxe-table .vxe-sort--desc-btn.sort--active) {
    color: var(--ant-primary-color);
  }

  :deep(.vxe-sort--asc-btn) {
    font-size: 0.8em;
  }

  :deep(.vxe-sort--desc-btn) {
    font-size: 0.8em;
  }
</style>
