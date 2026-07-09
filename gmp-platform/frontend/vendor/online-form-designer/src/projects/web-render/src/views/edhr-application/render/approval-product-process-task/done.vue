<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    showPagination
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #custom_item="{ record }">
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
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { useTask } from './useTask';
  import ProductPopover from '/@web-render/views/edhr-application/components/product-popover/index.vue';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { ProcessTaskTodoApproveHisResponse } from '/@/apis/gct-apaas/model';
  import { postProcessTaskDoneApproveHisPageList } from '/@/apis/gct-apaas/ProcessTaskDoneController';
  import {
    ModalName,
    openApprovalSubjectInfoModal,
  } from '/@/projects/web-render/src/views/edhr-application/components/approval-process-temp';

  const { t } = useI18n();

  withDefaults(
    defineProps<{
      canHandle?: boolean;
    }>(),
    {
      canHandle: true,
    },
  );

  const columnDefinitions = [
    { title: t('sys.edhr.field.name'), field: 'name', minWidth: 200 },
    { title: t('sys.edhr.field.version'), field: 'version', minWidth: 200 },
    { title: t('sys.edhr.field.productFamily'), field: 'productFamilyName', minWidth: 200 },
    { title: t('sys.edhr.field.productCode'), field: 'productCode', minWidth: 200 },
    { title: t('sys.edhr.field.productName'), field: 'productName', minWidth: 200 },
    { title: t('sys.edhr.field.productSpec'), field: 'productSpec', minWidth: 200 },
    {
      title: t('sys.edhr.field.productionMode'),
      field: 'productProcessProductionType',
      minWidth: 200,
      slots: {
        default({ row }) {
          return row.productProcessProductionType === 'standard'
            ? t('sys.edhr.field.standard')
            : row.productProcessProductionType === 'rework'
              ? t('sys.edhr.field.rework')
              : t('sys.edhr.field.overwrite');
        },
      },
    },
    { title: t('sys.edhr.field.createUser'), field: 'approveHisCreateUserName' },
    { title: t('sys.edhr.field.createTime'), field: 'approveHisCreateTime', minWidth: 176 },
  ];

  const { formState, activeTabKey } = useTask();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<ProcessTaskTodoApproveHisResponse[]>([]);

  onMounted(() => getTableData(1));

  watch(activeTabKey, (value) => {
    if (value === '1') {
      getTableData(1);
    }
  });

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await postProcessTaskDoneApproveHisPageList({
      ...formState,
      taskType: 'PRODUCT_PROCESS',
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
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

  const handleView = async (record: ProcessTaskTodoApproveHisResponse) => {
    await openApprovalSubjectInfoModal(record, ModalName.ProductProcess, {
      detailMode: true,
      width: 1200,
    });
  };

  defineExpose({
    getTableData,
  });
</script>

<style></style>
