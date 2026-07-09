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
    <template #custom_item="{ column: { field }, record }">
      <ProductPopover :id="record.productId" :name="record.productCode" />
    </template>
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
          {
            label: $t('sys.edhr.handle'),
            onClick: () => handleTask(record),
          },
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
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import {
    useApaasEbr,
    shouldShowFormSource,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import BaseVxeTable from '../../../../../components/base-vxe-table/index.vue';
  import ProductPopover from '/@web-render/views/edhr-application/components/product-popover/index.vue';
  import { getProcessTaskTodoPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';

  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: $t('sys.edhr.serialNo'), field: 'serialNo', minWidth: 180 },
    { title: $t('sys.onlineForm.formName'), field: 'ofTmplName', minWidth: 160 },
    { title: $t('sys.onlineForm.remarkName'), field: 'title', minWidth: 150 },
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 180 },
    {
      title: $t('sys.onlineForm.productCode'),
      field: 'productCode',
      minWidth: 160,
      slots: { default: 'custom_render' },
    },
    { title: $t('sys.creator'), field: 'ofCreateUserName' },
    { title: t('sys.createTime'), field: 'taskStartTime', minWidth: 176 },
    {
      title: $t('sys.webRender.edhrApplication.recordType'),
      field: 'materialStatus',
      minWidth: 100,
      slots: { default: 'material_status_render' },
    },
  ];

  const { openSingleDrawer, openFillWikiFullScreenModal } = useApaasEbr();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<ProcessTaskTodoResponse[]>([]);

  onMounted(() => getTableData(1));

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await getProcessTaskTodoPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      notEdhr: 1, // 只查询非DHR表单
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

  // 表单审核页面【详情按钮】
  const handleView = (record: ProcessTaskTodoResponse) => {
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
        title: $t('sys.onlineForm.formDetail'),
        keep: false,
        isViewPage: true,
        params: {
          _gct_nocode_mfg_order_id_: record?.mfgOrderId,
        },
      });
    }
  };

  // 表单审核页面【处理按钮】
  const handleTask = (record: ProcessTaskTodoResponse) => {
    if (shouldShowFormSource(record)) {
      openFillWikiFullScreenModal({
        materialNo: record.materialNo,
        ofTmplId: record.docOutlineId,
        ofInstanceId: record.ofInstanceId,
        viewPageLimit: true,
        isViewPage: false,
        needAutoSave: true,
        pageType: 'hide-create-instances',
        callback: () => getTableData(1),
        params: {
          _gct_nocode_mfg_order_id_: record?.mfgOrderId,
        },
      });
    } else {
      openSingleDrawer({
        selfId: record.ofInstanceId,
        keep: false,
        isViewPage: false,
        callback: () => getTableData(1),
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
