<template>
  <vxe-grid
    :border="true"
    id="reportTable"
    v-bind="gridOptions"
    ref="vxeTable"
    :maxHeight="maxHeight"
    :sort-config="{
      multiple: false,
      remote: true,
      trigger: 'cell',
    }"
    @sort-change="sortChangeEvent"
    :loading="loading"
    :scroll-y="{ enabled: true, oSize: 10 }"
    :style="{ '--line-clamp': lineClamp, '--link-color': linkColor }"
    :class="{ 'gct-report-fixed': reportFixed }"
    :export-config="exportConfig"
  >
    <template #top>
      <div class="mb16px" v-if="isDesign">
        <span class="preview">{{ $t('sys.report.resultPreview') }}</span>
      </div>
      <div class="pb16px ks-row text-right leading-none" v-if="showHeader">
        <crumbs :links="drillingLinkList" :crumbsClick="crumbsClick!" />
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
            <span class="pl6px text-14px row-total">全屏</span>
          </FullScreen>
          <ExportBtn
            class="ml-16px highlight"
            @reload="reloadTable"
            @exportExcel="exportExcel"
            :reportName="props.widget?.reportName"
            :reportType="$t('sys.report.detailTable')"
            :exportTable="exportTable"
          />
        </div>
      </div>
      <div v-else class="h30px"> </div>
    </template>
    <template #default="{ column, row, $columnIndex }">
      <fieldRender
        :key="column.field"
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
        :params="column.params"
      />
      <div v-else-if="showTotalRow" :key="column.field">
        <div class="row-total-text ell h-22px">
          {{ !$columnIndex ? calculationMethod?.totalAlias : '' }}
        </div>
        <footerRender :value="listStatisticData[column.field]" :params="column.params" />
      </div>
      <div v-else :key="column.field">
        <div class="ell" v-if="!$columnIndex && listStatisticData[column.field] === undefined">{{
          calculationMethod?.totalAlias
        }}</div>
        <footerRender :value="listStatisticData[column.field]" :params="column.params" v-else />
      </div>
    </template>
    <template #pager>
      <div v-if="pager" class="text-right mt16px">
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
  import { ref, onMounted, PropType, computed, toRefs } from 'vue';
  import { useReportTable } from './hooks';
  import { ReportTable } from '../../schema/index';
  import { useReportRender } from './field-render';
  import FullScreen from '/@/components/FullScreen/index.vue';
  import fieldSort from './components/field-sort.vue';
  import Filter from './components/filter-btn.vue';
  import crumbs from './components/crumbs.vue';
  import type { LinkItem } from './drilling-hook';
  import { useWatchReportFixed } from './report-hooks';
  import { ExportBtn, useExportReportData } from './components/report-export';
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
  const {
    calculationMethod,
    serialNumber,
    modelKey,
    pager,
    sorts,
    categorySelect,
    customHeader,
    fieldMap,
    dataColumn,
  } = props.widget!;
  const { fullScreen, filter, exportTable } = toRefs(props.widget!);
  const vxeTable = ref();
  const { exportConfig, exportData } = useExportReportData({ vxeTable });
  const { reportFixed } = useWatchReportFixed(props.widget, { vxeTable });
  const { fieldRender, footerRender, lineClamp, linkColor, renderTotal, transformValueByField } =
    useReportRender(props.widget!, {
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
    firstField,
    reloadTableColumn,
    getExportDataByHttp,
  } = useReportTable(props.widget!, {
    vxeTable,
    parentRef: props.parentRef,
    drillingLinkList: props.drillingLinkList,
    renderTotal,
    transformValueByField,
  });
  /**第一行是否被总计占位 */
  const showTotalRow = computed(() => listStatisticData.value[firstField.value] !== undefined);
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

  /** 行维度和列维度总和 */
  const columns = computed(() => {
    return dataColumn.map((i) => {
      return {
        title: fieldMap[i].fieldName,
        params: {
          fieldType: fieldMap[i].fieldType,
          field: i.replace('dataColumn:', ''),
        },
      };
    });
  });

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
