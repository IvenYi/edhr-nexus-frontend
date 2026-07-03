<template>
  <div class="h-full flex flex-col">
    <div class="flex-none">
      <a-button type="primary" @click="handleAdd"> {{ $t('sys.ipaas.newBizInterface') }} </a-button>
    </div>
    <a-table
      class="flex-1 h-1px mt-16px"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelectChange }"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
      ref="tableContainerRef"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'authMode'">
          {{ t('sys.ipaas.authModeEnum.' + record.authMode) }}
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
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
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import {
    getConnectorConfigPageList,
    getConnectorConfigInfo,
    deleteConnectorConfig,
  } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import { getAuthTestConnectOnce } from '/@/apis/gct-ipaas2/AuthController';
  import type { AppConnectorResp } from '/@/apis/gct-ipaas2/model';
  import { GctDialog } from '/@/utils/Dialog';
  import { AuthModeEnum } from '/@ipaas/enums';
  import ApiDefModal from './api-def-modal.vue';

  type Key = string | number;

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const { t } = useI18n();
  const selectedRowKeys = ref<Key[]>([]);
  const loading = ref<boolean>(false);
  const tableData = ref<any[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.ipaas.appName'),
      dataIndex: 'appName',
      key: 'appName',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.appBrand'),
      dataIndex: 'brand',
      key: 'brand',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.appVersion'),
      dataIndex: 'version',
      key: 'version',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.authMode'),
      dataIndex: 'authMode',
      key: 'authMode',
    },
    {
      title: t('sys.ipaas.connectCount'),
      dataIndex: 'connectCount',
      key: 'connectCount',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
      width: 180,
    },
    {
      title: t('sys.ipaas.lastUsedTime'),
      dataIndex: 'lastUsedTime',
      key: 'lastUsedTime',
      ellipsis: true,
      width: 180,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
    },
  ];

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getConnectorConfigPageList({
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
    // 查询时重置选中
    resetSelectedRowKeys();
  };
  getTableData();

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  /**
   * 选中
   */
  const handleSelectChange = (keys: Key[]) => {
    selectedRowKeys.value = keys;
  };
  const resetSelectedRowKeys = () => {
    selectedRowKeys.value = [];
  };

  const handleAdd = () => {
    GctDialog.open(ApiDefModal, {
      options: {
        title: t('sys.newSth', { sth: t('sys.ipaas.connector') }),
      },
      callback: async () => {
        getTableData(1);
      },
    });
  };

  const handleEdit = () => {};
  const handleDelete = () => {};
</script>

<style></style>
