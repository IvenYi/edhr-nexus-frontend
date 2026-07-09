<template>
  <div class="ks-col content p16px ks-column h-full overflow-hidden">
    <SearchForm v-model:value="form" @on-search="() => getTableData(1)" />
    <base-vxe-table
      class="h-100%"
      :tableColumns="columnDefinitions"
      :data-source="tableData"
      :loading="loading"
      showPagination
      :action="{ width: 200 }"
      v-model:pagination="pagination"
      @request-table-data="handleTableChange"
    >
      <template #operate="{ row }">
        <table-action-auto :actions="getActions(row)" :stopButtonPropagation="true" />
      </template>
    </base-vxe-table>
  </div>
</template>
<script setup lang="ts">
  import { message, Modal, TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onMounted, reactive, ref, unref } from 'vue';
  import { TableActionAuto } from '/@/components/Table';
  import SearchForm from './search-form.vue';
  import BaseVxeTable from '../../../components/base-vxe-table/index.vue';
  import DetailModal from '/@web-render/views/edhr-application/render/document-control-management/components/detail-modal/index.vue';
  import ReassignModal from '/@web-render/views/edhr-application/render/document-control-management/components/reassign-modal.vue';
  import {
    postDocControlProcessInterfereReassign,
    postDocControlProcessInterfereReturn,
  } from '/@/apis/gct-apaas/DocControlProcessController';
  import { getDocControlTaskTodoAllUserPageList } from '/@/apis/gct-apaas/DocControlTaskTodoController';
  import { useDocumentTask } from '../useDocumentTask';

  const { t } = useI18n();
  const { userActions } = useDocumentTask();

  const columnDefinitions = [
    { title: t('sys.edhr.controlFileName'), field: 'docName', minWidth: 300 },
    { title: t('sys.edhr.controlFileCode'), field: 'docCode', minWidth: 250 },
    { title: t('sys.appDesigner.version'), field: 'version' },
    { title: t('sys.edhr.subcategory'), field: 'categoryName' },
    {
      title: t('sys.edhr.controlFileType'),
      field: 'controlTmplType',
      minWidth: 140,
      params: { i18nPrefix: 'sys.edhr.intervention' },
      slots: { default: 'value_i18n_render' },
    },
    { title: t('sys.edhr.businessOfflineVersion'), field: 'offlineVersion', minWidth: 120 },
    // {
    //   title: t('sys.edhr.controlStatus'),
    //   field: 'controlStatus',
    //   minWidth: 140,
    //   slots: { default: 'control_status_render' },
    // },

    { title: t('sys.edhr.controlReporter'), field: 'initiatorName' },
    { title: t('sys.edhr.controlReportTime'), field: 'taskStartTime', minWidth: 176 },
  ];

  const form = ref<any>({});

  const loading = ref(false);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const tableData = ref<any[]>([]);

  onMounted(() => getTableData(1));

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res: any = await getDocControlTaskTodoAllUserPageList({
      ...unref(form),
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

  const onDetail = async (data) => {
    const res = await gct.openUtil.drawer(
      DetailModal,
      {
        data,
        readonly: true,
        isInit: false,
      },
      {
        width: 1200,
        title: t('sys.detail'),
      },
    );
    if (res.ok) {
      getTableData();
    }
  };

  const onReassign = async (data) => {
    const res = await gct.openUtil.modal(
      ReassignModal,
      {
        data,
      },
      {
        width: 640,
        title: t('sys.appDesigner.approval.button.Reassign'),
        showFooter: true,
      },
    );
    if (res.ok) {
      await postDocControlProcessInterfereReassign({
        ...res.params,
      });
      message.success(t('sys.doSuccess'));
      getTableData(1);
    }
  };
  const onReject = async (data) => {
    const { docBaseId, docVersionId } = data;
    Modal.confirm({
      title: t('sys.edhr.confirmWithdraw'),
      async onOk() {
        await postDocControlProcessInterfereReturn({ tmplId: `${docBaseId}:${docVersionId}` });
        message.success(t('sys.doSuccess'));
        getTableData(1);
      },
      onCancel() {},
    });
  };

  const getActions = (record) => {
    return [
      {
        label: t('sys.detail'),
        onClick: () => onDetail(record),
      },
      {
        label: t('sys.appDesigner.approval.button.Reassign'),
        ifShow: userActions.value.TmplReassign,
        onClick: () => onReassign(record),
      },
      {
        label: t('sys.edhr.withdraw'),
        ifShow: userActions.value.TmplWithdraw,
        onClick: () => onReject(record),
      },
    ];
  };
</script>
<style lang="less" scoped></style>
