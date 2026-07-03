<template>
  <a-table
    class="h-full"
    row-key="id"
    :columns="columns"
    :data-source="tableData"
    bordered
    :pagination="false"
    :loading="loading"
    @expand="handleExpand"
    size="middle"
    ref="tableContainerRef"
    :scroll="{
      x: 'max-content',
      y: scrollHeight,
    }"
  >
    <template #expandedRowRender="{ record }">
      <a-table
        v-if="addressStatusMap[record.macAddress]"
        class="table__left-space"
        row-key="id"
        :columns="printerColumns"
        :data-source="addressPrinterMap[record.macAddress]?._data_source_ ?? []"
        bordered
        :pagination="false"
        :loading="addressPrinterMap[record.macAddress]._loading_"
        size="middle"
      >
        <template #bodyCell="{ column, record: printRecord }">
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.integration.testPrint'),
                  onClick: () => handlePrintTest(record, printRecord),
                  ifShow: !!addressStatusMap[record.macAddress],
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
      <div class="text-center" v-else>{{ t('sys.integration.printServiceOffline') }}</div>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <span>{{ record.name }}</span>
        <span
          v-if="record.tmplSaveAddress"
          class="inline-flex justify-center items-center ml-1 w-[68px] h-[18px] text-[#FE5532] border-solid border-[#FE553288] rounded-[3px] text-xs"
        >
          BarTender
        </span>
      </template>
      <template v-if="column.key === 'status'">
        <span v-if="addressStatusMap[record.macAddress]" class="status status--online">{{
          t('sys.online')
        }}</span>
        <span v-else class="status status--offline">{{ t('sys.offline') }}</span>
      </template>
      <template v-else-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.integration.printLogs'),
              onClick: () => handleViewLogs(record),
            },
            {
              label: t('sys.notes'),
              onClick: () => handleEditRemark(record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDelete'),
                confirm: () => handleDelete(record),
              },
              ifShow: !addressStatusMap[record.macAddress],
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>

  <print-log-modal @register="register" />
  <print-test-modal @register="registerPrintTest" />
  <print-remark-modal @register="registerPrintRemark" @ok="getTableData" />
</template>

<script setup lang="tsx">
  import { ref, onBeforeUnmount } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType } from 'ant-design-vue';
  import {
    getPrintResourceList,
    getPrintResourceListByMacAddress,
    deletePrintResource,
    getPrintResourceGetIpAddressStatus,
  } from '/@/apis/gct-platform/PrintResourceController';
  import type { PrintResourceResponse, PrintListDto } from '/@/apis/gct-platform/model';
  import { PrintResourceEnum } from '../enum';
  import { TableActionAuto } from '/@/components/Table';
  import { message } from 'ant-design-vue';
  import PrintLogModal from '../modals/print-log-modal.vue';
  import PrintTestModal from '../modals/print-test-modal.vue';
  import PrintRemarkModal from '../modals/print-remark-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { usePrintResource } from '../hooks/usePrintResource';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';

  interface PrintItem {
    _loading_?: boolean;
    _data_source_?: PrintListDto[];
  }

  enum QueryStateEmum {
    Default,
    WithStatus,
  }

  const { t } = useI18n();
  const { updatePrintResourceCountByType } = usePrintResource();
  const [register, { openModal }] = useModal();
  const [registerPrintTest, { openModal: openPrintTestModal }] = useModal();
  const [registerPrintRemark, { openModal: openPrintRemarkModal }] = useModal();
  const tableContainerRef = ref();
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef, {
    pagination: false,
    triggerByWindowSize: false,
  });

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
  const addressPrinterMap = ref<Record<string, PrintItem>>({});
  const checkStatus = async () => {
    clearCheckStatusTimer();
    const addressList = [...new Set(tableData.value.map((item) => item.macAddress))];
    for (let item of addressList) {
      const res = await getPrintResourceGetIpAddressStatus({
        address: item!,
        type: PrintResourceEnum.CLIENT_PRINT,
      });
      addressStatusMap.value[item!] = res!;
    }
    checkStatusTimer = setTimeout(() => {
      checkStatus();
    }, 10 * 1000);
  };
  const getTableData = async (queryState: QueryStateEmum = QueryStateEmum.Default) => {
    const res = await getPrintResourceList({
      type: PrintResourceEnum.CLIENT_PRINT,
      queryState,
    });
    tableData.value = res ?? [];
    updatePrintResourceCountByType(PrintResourceEnum.CLIENT_PRINT, tableData.value.length);
  };
  getTableData().then(() => {
    checkStatus();
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.service') }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.keyOfSth', { sth: t('sys.service') }),
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('sys.macAddress'),
      dataIndex: 'macAddress',
      key: 'macAddress',
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
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
    },
  ];

  const printerColumns: TableColumnsType = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.printer') }),
      dataIndex: 'printName',
      key: 'printName',
    },
    {
      title: t('sys.brand'),
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: t('sys.default'),
      dataIndex: 'defaultPrint',
      key: 'defaultPrint',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleExpand = async (expanded, record: PrintResourceResponse) => {
    const { macAddress } = record;

    if (expanded && !addressPrinterMap.value[macAddress!] && addressStatusMap.value[macAddress!]) {
      addressPrinterMap.value[macAddress!] = {
        _loading_: true,
      };
      const res = await getPrintResourceListByMacAddress({
        macAddress,
      }).finally(() => {
        addressPrinterMap.value[macAddress!]._loading_ = false;
      });
      addressPrinterMap.value[macAddress!]._data_source_ = res ?? [];
    }
  };

  const handleViewLogs = (record) => {
    openModal(true, {
      key: record.key,
    });
  };

  const handleDelete = async ({ id }) => {
    await deletePrintResource({
      ids: id,
    });
    message.success(t('sys.operationSuccess'));
    getTableData();
  };

  const handlePrintTest = (record, printRecord) => {
    openPrintTestModal(true, {
      key: record.key,
      macAddress: record.macAddress,
      resourceType: PrintResourceEnum.CLIENT_PRINT,
      printName: printRecord.printName,
    });
  };

  const handleEditRemark = (record) => {
    openPrintRemarkModal(true, {
      ...record,
    });
  };

  defineExpose({
    calcScrollHeight,
  });
</script>

<style lang="less" scoped>
  @import '../style/index.less';

  .table__left-space :deep(.ant-table) {
    margin-left: 39px !important;
  }
</style>
