<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.integration.printLogs')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    :footer="null"
  >
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.download'),
                onClick: () => handleDownload(record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPrintLogPageList } from '/@/apis/gct-platform/ExternalPrintLogController.ts';
  import type { PrintLogResponse } from '/@/apis/gct-platform/model';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { downloadByData, downloadByBase64 } from '/@/utils/file/download';
  import { message } from 'ant-design-vue';
  import { PrintTypeEnum } from '../enum';

  const { t } = useI18n();
  const [registerInner] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, data);
    getTableData();
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.integration.printTime'),
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: t('sys.printer'),
      dataIndex: 'printName',
      key: 'printName',
    },
    {
      title: t('sys.nameOfSth', { sth: t('sys.app.index') }),
      dataIndex: 'printAppName',
      key: 'printAppName',
    },
    {
      title: t('sys.quantity'),
      dataIndex: 'printNumber',
      key: 'printNumber',
    },
    {
      title: t('sys.integration.printContent'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const formState: { key?: string } = reactive({
    key: undefined,
  });
  const tableData = ref<PrintLogResponse[]>([]);
  // 分页
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    size: 'small',
    showTotal: (total) => t('sys.component.table.total', { total }),
  });
  const loading = ref<boolean>(false);

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getPrintLogPageList({
      ...formState,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.total = res!.totalCount;
    tableData.value = res!.data;
  };
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleClose = () => {
    formState.key = undefined;
    tableData.value = [];
    pagination.current = 1;
  };

  const handleDownload = (record: PrintLogResponse) => {
    const isText = [PrintTypeEnum.Zpl, PrintTypeEnum.String, PrintTypeEnum.Btw].includes(
      record.printType as PrintTypeEnum,
    );
    if (isText) {
      downloadByData(record.printContent ?? '', { filename: `${Date.now()}.txt` });
      message.success(t('sys.downloadSuccess'));
      return;
    }
    if ((record.printType as PrintTypeEnum) == PrintTypeEnum.Png) {
      downloadByBase64(`data:image/png;base64,${record.printContent}` ?? '', `${Date.now()}.png`);
      message.success(t('sys.downloadSuccess'));
    }
  };
</script>

<style lang="less"></style>
