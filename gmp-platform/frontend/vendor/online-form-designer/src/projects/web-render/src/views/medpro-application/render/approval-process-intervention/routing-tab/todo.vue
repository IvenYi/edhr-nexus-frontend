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
            ifShow: userActions.RoutingReassign,
            label: t('sys.bpmn.button.Reassign'),
            onClick: () => handleReassign(record),
          },
          {
            ifShow: userActions.RoutingWithdraw,
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
  import { TableActionAuto } from '/@/components/Table';
  import { useDocumentTask } from '../useDocumentTask';
  import type { ProcessTaskTodoApproveHisResponse } from '/@/apis/gct-apaas/model';
  import { IModalData } from '@gct/runtime';
  import { postProcessTaskTodoApproveHisPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';
  import {
    ModalName,
    openApprovalSubjectInfoModal,
  } from '/@/projects/web-render/src/views/edhr-application/components/approval-process-temp';
  import ReassignModal from '../reassign-modal.vue';
  import {
    postApproveProcessReassign,
    postApproveProcessReturn,
  } from '/@/apis/gct-apaas/ApproveProcessController';
  import { ApprovalControlStatusEnum } from '/@app-designer/views/online-form/constants';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: '名称', field: 'name', minWidth: 200 },
    { title: '编码', field: 'code', minWidth: 200 },
    { title: '版本', field: 'version', minWidth: 200 },
    { title: '处理人', field: 'assigneeName' },
    { title: '创建人', field: 'approveHisCreateUserName' },
    { title: '创建时间', field: 'approveHisCreateTime', minWidth: 176 },
  ];

  const { formState, userActions } = useDocumentTask();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<ProcessTaskTodoApproveHisResponse[]>([]);

  onMounted(() => getTableData(1));

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }

    loading.value = true;
    const res = await postProcessTaskTodoApproveHisPageList({
      ...formState,
      taskType: 'ROUTING',
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

  /** 详情 */
  const handleView = async (record: ProcessTaskTodoApproveHisResponse) => {
    await openApprovalSubjectInfoModal(record, ModalName.Routing, { detailMode: true });
  };

  /** 转发 */
  const handleReassign = async (record: ProcessTaskTodoApproveHisResponse) => {
    const res = await gct.openUtil.modal<IModalData>(
      ReassignModal,
      {
        data: record,
        callback: async (queryData) => {
          await postApproveProcessReassign({
            ofInstId: record.ofInstanceId!,
            businessId: record.businessId,
            taskId: record.taskId,
            ...queryData,
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
  const handleWithdraw = async (record: ProcessTaskTodoApproveHisResponse) => {
    Modal.confirm({
      title: t('sys.edhr.withdrawConfirm'),
      async onOk() {
        await postApproveProcessReturn({
          businessId: record.businessId,
          taskId: record.taskId,
        } as any);
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
