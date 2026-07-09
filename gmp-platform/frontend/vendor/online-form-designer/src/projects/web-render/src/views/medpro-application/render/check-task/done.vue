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
  import BaseVxeTable from '/@web-render/views/edhr-application/components/base-vxe-table/index.vue';
  import {
    useApaasEbr,
    shouldShowFormSource,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import { getProcessTaskDonePageList } from '/@/apis/gct-apaas/ProcessTaskDoneController';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { ProcessTaskDoneResponse } from '/@/apis/gct-apaas/model';
  import ProductPopover from '/@web-render/views/edhr-application/components/product-popover/index.vue';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: '流水号', field: 'serialNo', minWidth: 150 },
    { title: '备注名', field: 'title', minWidth: 150 },
    { title: '名称', field: 'ofTmplName', minWidth: 200 },
    { title: '编号', field: 'ofCode', minWidth: 200 },
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 150 },
    { title: '工单编号', field: 'mfgOrderCode', minWidth: 200 },
    { title: '产品编号', field: 'productCode', minWidth: 130 },
    { title: '产品名称', field: 'productName', minWidth: 200 },
    { title: '规格型号', field: 'productSpec', minWidth: 150 },
    // {
    //   title: '当前流程状态',
    //   field: 'processInstanceStatus',
    //   minWidth: 140,
    //   slots: { default: 'work_status_render' },
    // },
    // {
    //   title: '记录类型',
    //   field: 'materialStatus',
    //   minWidth: 140,
    //   slots: { default: 'material_status_render' },
    // },
    // { title: '所属DHR模板', field: 'edhrTmplName', minWidth: 300 },
    { title: '创建人', field: 'ofCreateUserName' },
    { title: '创建时间', field: 'taskStartTime', minWidth: 176 },
    // { title: '任务审核时间', field: 'taskEndTime', minWidth: 176 },
  ];

  const { formState, activeTabKey } = useDocumentTask();
  const { openFillWikiFullScreenModal, openSingleDrawer } = useApaasEbr();

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
      notEdhr: 1, // 只查询非DHR表单
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

  const handleView = (record: ProcessTaskDoneResponse) => {
    if (shouldShowFormSource(record)) {
      openFillWikiFullScreenModal({
        materialNo: record.materialNo,
        ofTmplId: record.docOutlineId,
        ofInstanceId: record.ofInstanceId,
        isViewPage: true,
        needAutoSave: false,
        params: {
          _gct_nocode_mfg_order_id_: record?.mfgOrderId,
        },
      });
    } else {
      openSingleDrawer({
        selfId: record.ofInstanceId,
        keep: false,
        title: '表单详情',
        isViewPage: true,
        params: {
          _gct_nocode_mfg_order_id_: record?.mfgOrderId,
        },
      });
    }
  };

  defineExpose({
    getTableData,
  });
</script>

<style></style>
