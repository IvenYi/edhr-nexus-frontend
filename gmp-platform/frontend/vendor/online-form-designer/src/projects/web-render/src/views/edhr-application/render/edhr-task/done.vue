<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    showPagination
    :action="{ width: 100 }"
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #custom_item="{ column: { field }, record }">
      <ProductPopover :id="record.productId" :name="record.productCode" />
    </template>
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
          {
            label: t('sys.detail'),
            onClick: () => handleView(record),
          },
        ]"
        :stopButtonPropagation="true"
      />
    </template>
  </base-vxe-table>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import { useDocumentTask } from './useDocumentTask';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { getProcessTaskDonePageList } from '/@/apis/gct-apaas/ProcessTaskDoneController';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { ProcessTaskDoneResponse } from '/@/apis/gct-apaas/model';
  import ProductPopover from '../../components/product-popover/index.vue';

  const { t } = useI18n();
  const emit = defineEmits(['detail']);

  const columnDefinitions = [
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 150 },
    {
      title: $t('sys.edhr.field.mfgOrder'),
      field: 'mfgOrderCode',
      minWidth: 130,
    },
    {
      title: $t('sys.onlineForm.productCode'),
      field: 'productCode',
      minWidth: 130,
      slots: { default: 'custom_render' },
    },
    { title: $t('sys.edhr.field.productName'), field: 'productName', minWidth: 200 },
    { title: $t('sys.edhr.field.productSpec'), field: 'productSpec', minWidth: 150 },
    { title: $t('sys.edhr.field.edhrTmplName'), field: 'edhrTmplName', minWidth: 150 },
    {
      title: $t('sys.edhr.field.recordType'),
      field: 'materialStatus',
      minWidth: 120,
      slots: { default: 'material_status_render' },
    },
    { title: $t('sys.edhr.summaryUser'), field: 'starterName' },
    // { title: '接收时间', field: 'taskStartTime', minWidth: 176 },
    { title: $t('sys.edhr.verifyTime'), field: 'taskEndTime', minWidth: 176 },
  ];

  const { formState, activeTabKey } = useDocumentTask();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<ProcessTaskDoneResponse[]>([]);

  onMounted(() => getTableData(1));

  watch(activeTabKey, (value) => {
    if (value === '2') {
      getTableData(1);
    }
  });

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await getProcessTaskDonePageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      onlyEdhr: 1,
      taskType: 'EDHR_SUMMARY',
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleView = (record) => {
    emit('detail', record);
  };

  defineExpose({
    getTableData,
  });
</script>

<style></style>
