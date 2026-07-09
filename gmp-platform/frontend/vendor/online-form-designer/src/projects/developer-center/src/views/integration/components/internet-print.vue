<template>
  <div class="my-10px flex-none" style="text-align: right">
    <a-button type="primary" @click="handleAdd"><plus-outlined />{{ t('sys.add') }}</a-button>
  </div>

  <a-table
    class="flex-1 h-100px"
    row-key="id"
    :columns="columns"
    :data-source="tableData"
    bordered
    :pagination="false"
    :loading="loading"
    size="middle"
    ref="tableContainerRef"
    :scroll="{
      x: 'max-content',
      y: scrollHeight,
    }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'status'">
        <span v-if="addressStatusMap[record.printIp]" class="status status--online">{{
          t('sys.online')
        }}</span>
        <span v-else class="status status--offline">{{ t('sys.offline') }}</span>
      </template>
      <template v-else-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.integration.testPrint'),
              onClick: () => handlePrintTest(record),
              ifShow: !!addressStatusMap[record.printIp],
            },
            {
              label: t('sys.integration.printLogs'),
              onClick: () => handleViewLogs(record),
            },
            {
              label: t('sys.edit'),
              onClick: () => handleEdit(record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDelete'),
                confirm: () => handleDelete(record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>

  <print-log-modal @register="register" />
  <print-test-modal @register="registerPrintTest" />
  <print-form-modal @register="registerPrintForm" @ok="getTableData" />
</template>

<script setup lang="tsx">
  import { ref, onBeforeUnmount } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType } from 'ant-design-vue';
  import {
    getPrintResourceList,
    deletePrintResource,
    getPrintResourceGetIpAddressStatus,
  } from '/@/apis/gct-platform/PrintResourceController';
  import type { PrintResourceResponse } from '/@/apis/gct-platform/model';
  import { PrintResourceEnum } from '../enum';
  import { TableActionAuto } from '/@/components/Table';
  import { message } from 'ant-design-vue';
  import PrintLogModal from '../modals/print-log-modal.vue';
  import PrintTestModal from '../modals/print-test-modal.vue';
  import PrintFormModal from '../modals/print-form-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { usePrintResource } from '../hooks/usePrintResource';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';

  const { t } = useI18n();
  const { updatePrintResourceCountByType } = usePrintResource();
  const [register, { openModal }] = useModal();
  const [registerPrintTest, { openModal: openPrintTestModal }] = useModal();
  const [registerPrintForm, { openModal: openPrintFormModal }] = useModal();
  const tableContainerRef = ref();
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef, {
    pagination: false,
    triggerByWindowSize: false,
  });

  enum QueryStateEmum {
    Default,
    WithStatus,
  }

  const tableData = ref<PrintResourceResponse[]>([]);
  const loading = ref<boolean>(false);
  let checkStatusTimer: any = null;
  const clearCheckStatusTimer = () => {
    if (checkStatusTimer) {
      clearTimeout(checkStatusTimer);
      checkStatusTimer = null;
    }
  };
  onBeforeUnmount(() => {
    clearCheckStatusTimer();
  });
  const addressStatusMap = ref<Record<string, boolean>>({});
  const checkStatus = async () => {
    clearCheckStatusTimer();
    const addressList = [...new Set(tableData.value.map((item) => item.printIp))];
    for (let item of addressList) {
      const res = await getPrintResourceGetIpAddressStatus({
        address: item!,
        type: PrintResourceEnum.INTERNET_PRINT,
      });
      addressStatusMap.value[item!] = res!;
    }
    checkStatusTimer = setTimeout(() => {
      checkStatus();
    }, 10 * 1000);
  };
  const getTableData = async (queryState: QueryStateEmum = QueryStateEmum.Default) => {
    const res = await getPrintResourceList({
      type: PrintResourceEnum.INTERNET_PRINT,
      queryState,
    });
    tableData.value = res ?? [];
    updatePrintResourceCountByType(PrintResourceEnum.INTERNET_PRINT, tableData.value.length);
  };
  getTableData().then(() => {
    checkStatus();
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.printer') }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.keyOfSth', { sth: t('sys.printer') }),
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('sys.integration.ipAddress'),
      dataIndex: 'printIp',
      key: 'printIp',
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: t('sys.brand'),
      dataIndex: 'brand',
      key: 'brand',
      customRender: ({ text }) => {
        return <div style="min-width:30px;max-width:100px">{text}</div>;
      },
    },
    {
      title: t('sys.notes'),
      dataIndex: 'remark',
      key: 'remark',
      customRender: ({ text }) => {
        return <div style="min-width:30px;max-width:300px">{text}</div>;
      },
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 280,
    },
  ];

  const handleViewLogs = (record) => {
    openModal(true, {
      key: record.key,
    });
  };

  const handleAdd = () => {
    openPrintFormModal(true, {});
  };

  const handleEdit = (record) => {
    openPrintFormModal(true, {
      edit: true,
      record,
    });
  };

  const handleDelete = async ({ id }) => {
    await deletePrintResource({
      ids: id,
    });
    message.success(t('sys.operationSuccess'));
    getTableData();
  };

  const handlePrintTest = (record) => {
    openPrintTestModal(true, {
      key: record.key,
      resourceType: PrintResourceEnum.INTERNET_PRINT,
      printName: record.name,
      printType: 'string',
      printIp: record.printIp,
    });
  };

  defineExpose({
    calcScrollHeight,
  });
</script>

<style lang="less" scoped>
  @import url('../style/index.less');
</style>
