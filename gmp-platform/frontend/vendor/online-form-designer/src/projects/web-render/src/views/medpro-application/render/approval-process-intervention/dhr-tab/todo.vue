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
            ifShow: userActions.DhrReassign,
            label: t('sys.bpmn.button.Reassign'),
            onClick: () => handleReassign(record),
          },
          {
            ifShow: userActions.DhrWithdraw,
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
  import BaseVxeTable from '/@web-render/views/edhr-application/components/base-vxe-table/index.vue';
  import {
    useApaasEbr,
    shouldShowFormSource,
  } from '/@online-form/views/integration/apaas_ebr/index';

  import { TableActionAuto } from '/@/components/Table';
  import { useDocumentTask } from '../useDocumentTask';
  import type { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';
  import ReassignModal from '../reassign-modal.vue';
  import { IModalData } from '@gct/runtime';
  import { postProcessTaskTodoApproveHisPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';
  import {
    postApproveProcessReassign,
    postApproveProcessReturn,
  } from '/@/apis/gct-apaas/ApproveProcessController';
  import { ApprovalControlStatusEnum } from '/@app-designer/views/online-form/constants';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 150 },
    {
      title: '记录类型',
      field: 'materialStatus',
      minWidth: 150,
      slots: { default: 'material_status_render' },
    },
    {
      title: '工单编号',
      field: 'mfgOrderCode',
      minWidth: 130,
    },
    { title: '产品编号', field: 'productCode', minWidth: 130 },
    { title: '产品名称', field: 'productName', minWidth: 200 },
    { title: '规格型号', field: 'productSpec', minWidth: 150 },
    { title: 'DHR名称', field: 'edhrTmplName', minWidth: 150 },
    { title: '处理人', field: 'assigneeName' },
    { title: '创建人', field: 'approveHisCreateUserName', minWidth: 150 },
    { title: '创建时间', field: 'approveHisCreateTime', minWidth: 100 },
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
    const res = await postProcessTaskTodoApproveHisPageList({
      ...formState,
      taskType: 'EDHR_SUMMARY',
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
        title: '表单详情',
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
          await postApproveProcessReassign({
            ...queryData,
            ofInstId: record.ofInstanceId!,
            businessId: record.businessId,
            taskId: record.taskId,
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
      title: t('sys.edhr.withdrawConfirm'),
      async onOk() {
        await postApproveProcessReturn({
          businessId: record.businessId,
          taskId: record.taskId,
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
