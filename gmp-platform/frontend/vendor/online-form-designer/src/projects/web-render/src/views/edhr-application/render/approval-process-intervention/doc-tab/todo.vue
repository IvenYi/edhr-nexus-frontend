<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    :action="{ width: 200 }"
    showPagination
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
          {
            label: t('sys.detail'),
            onClick: () => handleView(record),
          },
          {
            ifShow: userActions.DocReassign,
            label: t('sys.bpmn.button.Reassign'),
            onClick: () => handleReassign(record),
          },
          {
            ifShow: userActions.DocWithdraw,
            label: t('sys.edhr.withdraw'),
            onClick: () => handleWithdraw(record),
          },
        ]"
        :stopButtonPropagation="true"
      />
    </template>
  </base-vxe-table>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { message, Modal, type TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import BaseVxeTable from '../../../components/base-vxe-table/index.vue';
  import {
    useApaasEbr,
    shouldShowFormSource,
  } from '/@online-form/views/integration/apaas_ebr/index';

  import { TableActionAuto } from '/@/components/Table';
  import { useDocumentTask } from '../useDocumentTask';
  import { getProcessTaskTodoAllUserPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';
  import type { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';
  import ReassignModal from '../reassign-modal.vue';
  import { IModalData } from '@gct/runtime';
  import {
    postOnlineFormProcessInterfereReassign,
    postOnlineFormProcessInterfereReturn,
  } from '/@/apis/gct-apaas/OnlineFormProcessController';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: t('sys.edhr.serialNo'), field: 'serialNo', minWidth: 150 },
    { title: t('sys.onlineForm.remarkName'), field: 'title', minWidth: 150 },
    { title: t('sys.edhr.field.name'), field: 'ofTmplName', minWidth: 200 },
    { title: t('sys.edhr.field.code'), field: 'ofCode', minWidth: 200 },
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 150 },
    { title: t('sys.edhr.field.mfgOrder'), field: 'mfgOrderCode', minWidth: 200 },
    { title: t('sys.edhr.field.productCode'), field: 'productCode', minWidth: 130 },
    { title: t('sys.edhr.field.productName'), field: 'productName', minWidth: 200 },
    { title: t('sys.edhr.field.productSpec'), field: 'productSpec', minWidth: 150 },
    { title: t('sys.edhr.field.assignee'), field: 'assigneeName', minWidth: 150 },
    { title: t('sys.edhr.field.createUser'), field: 'ofCreateUserName' },
    { title: t('sys.edhr.field.createTime'), field: 'taskStartTime', minWidth: 176 },
  ];

  const { formState, userActions } = useDocumentTask();
  const { openFillWikiFullScreenModal, openSingleDrawer } = useApaasEbr();

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
    const res = await getProcessTaskTodoAllUserPageList({
      ...formState,
      taskType: 'FORM,EDHR',
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
        title: t('sys.onlineForm.formDetail'),
        keep: false,
        isViewPage: true,
        params: {
          _gct_nocode_mfg_order_id_: record?.mfgOrderId,
        },
      });
    }
  };

  /** 转发 */
  const handleReassign = async (record: ProcessTaskTodoResponse) => {
    const res = await gct.openUtil.modal<IModalData>(
      ReassignModal,
      {
        data: record,
        callback: async (queryData) => {
          await postOnlineFormProcessInterfereReassign({
            ofInstId: record.ofInstanceId!,
            taskId: record.taskId!,
            toUserId: queryData.toUserId!,
          });
        },
      },
      {
        title: t('sys.edhr.taskTransfer'),
      },
    );
    if (res.ok) {
      getTableData(1);
    }
  };

  /** 撤回 */
  const handleWithdraw = async (record: ProcessTaskTodoResponse) => {
    Modal.confirm({
      title: t('sys.edhr.withdrawConfirm', {
        sth: `${t('sys.pageDesigner.form')}`,
      }),
      async onOk() {
        await postOnlineFormProcessInterfereReturn({
          ofInstId: record.ofInstanceId!,
          taskId: record.taskId!,
        });
        message.success(t('sys.edhr.withdrawSuccess'));
        getTableData(1);
      },
      onCancel() {},
    });
  };

  defineExpose({
    getTableData,
  });
</script>
