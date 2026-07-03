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
            label: t('sys.bpmn.button.Reassign'),
            onClick: () => handleReassign(record),
          },
          {
            ifShow:
              record.processInstanceStatus === 'running' ||
              record.processInstanceStatus === 'RUNNING',
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
  import { ref, reactive, onMounted, computed } from 'vue';
  import { message, Modal, type TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import {
    useApaasEbr,
    shouldShowFormSource,
  } from '/@online-form/views/integration/apaas_ebr/index';

  import { TableActionAuto } from '/@/components/Table';
  import { useDocumentTask } from './useDocumentTask';
  import { getProcessTaskTodoAllUserPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';
  import type { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';
  import ReassignModal from './reassign-modal.vue';
  import { IModalData } from '@gct/runtime';
  import { postOnlineFormProcessInterfereReturn } from '/@/apis/gct-apaas/OnlineFormProcessController';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: '表单名称', field: 'ofTmplName', minWidth: 300 },
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 250 },
    {
      title: '当前流程状态',
      field: 'processInstanceStatus',
      minWidth: 140,
      slots: { default: 'work_status_render' },
    },
    {
      title: '记录类型',
      field: 'materialStatus',
      minWidth: 140,
      slots: { default: 'material_status_render' },
    },
    { title: '产品', field: 'productName', minWidth: 300 },
    { title: '所属DHR模板', field: 'edhrTmplName', minWidth: 300 },
    { title: t('sys.createUser'), field: 'createUserName' },
    { title: '处理人', field: 'assigneeName' },
    { title: t('sys.createTime'), field: 'createTime', minWidth: 176 },
    { title: '接收时间', field: 'taskStartTime', minWidth: 176 },
  ];

  const { formState } = useDocumentTask();
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
