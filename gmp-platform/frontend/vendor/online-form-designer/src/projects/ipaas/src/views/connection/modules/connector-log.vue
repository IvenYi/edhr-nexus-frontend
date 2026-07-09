<template>
  <div class="h-full">
    <div class="h-full flex flex-col">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item :label="t('sys.ipaas.connectorName')" name="appName">
              <a-input v-model:value="formState.appName" :max-length="32" allow-clear />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item :label="t('sys.ipaas.appBrand')" name="brand">
              <a-input v-model:value="formState.brand" :max-length="32" allow-clear />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item :label="t('sys.ipaas.connectMode')" name="connectMode">
              <a-select v-model:value="formState.connectMode" allow-clear>
                <a-select-option v-for="item in AuthConnectModeEnum" :key="item" :value="item">
                  {{ t('sys.ipaas.connectModeEnum.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.ipaas.accessTime')" name="accessTime">
              <DateRangePicker
                v-model:start="formState.startTime"
                v-model:end="formState.endTime"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.ipaas.connectStatus')" name="connectStatus">
              <a-select v-model:value="formState.connectStatus" allow-clear>
                <a-select-option v-for="item in AuthConnectStatusEnum" :key="item" :value="item">
                  {{ t('sys.ipaas.connectStatusEnum.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.ipaas.authMode')" name="authMode">
              <a-select v-model:value="formState.authMode" allow-clear>
                <a-select-option
                  v-for="item in [AuthModeEnum.ACCESS_TOKEN, AuthModeEnum.NONE, AuthModeEnum.AD]"
                  :key="item"
                  :value="item"
                >
                  {{ t('sys.ipaas.authModeEnum.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8" :offset="16">
            <div style="text-align: right">
              <a-button class="mr-10px" @click="onReset">
                {{ t('sys.reset') }}
              </a-button>
              <a-button type="primary" @click="() => getTableData(1)">
                {{ t('sys.queryText') }}
              </a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>

      <div class="flex-none flex mt-16px mb-16px">
        <!-- <a-button :disabled="selectedRowKeys.length === 0" danger @click="handleBatchExport">
          批量导出
        </a-button> -->
        <a-button v-if="userActions.ClearLog" class="ml-[auto]" danger @click="deleteTest">
          {{ t('sys.ipaas.clearTestLogs') }}
        </a-button>
      </div>

      <a-table
        class="flex-1 h-100px"
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
          <template v-if="column.key === 'connectMode'">
            {{ t('sys.ipaas.connectModeEnum.' + record.connectMode) }}
          </template>
          <template v-if="column.key === 'connectStatus'">
            <span class="connect-status" :class="record.connectStatus">
              {{ t('sys.ipaas.connectStatusEnum.' + record.connectStatus) }}
            </span>
          </template>
          <template v-if="['brand', 'version'].includes(column.key)">
            {{ record[column.key] ?? '--' }}
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.viewDetails'),
                  onClick: () => handleView(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import type { ConnectorLogRequest, ConnectorLogResponse } from '/@/apis/gct-ipaas2/model';
  import { GctDialog } from '/@/utils/Dialog';
  import { AuthModeEnum, AuthConnectStatusEnum, AuthConnectModeEnum } from '/@ipaas/enums';
  import ConnectionLogModal from './connector-log-modal.vue';
  import {
    postConnectorLogPageList,
    deleteConnectorLog,
  } from '/@/apis/gct-ipaas2/ConnectorLogController';
  import { Modal, message } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import DateRangePicker from '/@web-render/views/edhr-application/components/date-range-picker/date-range-picker.vue';
  import dayjs from 'dayjs';

  type Key = string | number;

  const props = defineProps<{
    tabKey: string | number;
    activeKey: string | number;
    userActions: { [key: string]: boolean };
  }>();

  const formState: ConnectorLogRequest = reactive({
    appName: undefined,
    brand: undefined,
    version: undefined,
    authMode: undefined,
    connectMode: undefined,
    connectStatus: undefined,
    startTime: undefined,
    endTime: undefined,
  });

  const formRef = ref<FormInstance>();
  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const { t } = useI18n();
  const selectedRowKeys = ref<Key[]>([]);
  const loading = ref<boolean>(false);
  const tableData = ref<ConnectorLogResponse[]>([]);
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
      title: t('sys.ipaas.connectorName'),
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
      title: t('sys.ipaas.version'),
      dataIndex: 'version',
      key: 'version',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.interfaceAddress'),
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.connectMode'),
      dataIndex: 'connectMode',
      key: 'connectMode',
      width: 100,
    },
    {
      title: t('sys.ipaas.authMode'),
      dataIndex: 'authMode',
      key: 'authMode',
      width: 100,
    },
    {
      title: t('sys.ipaas.connectStatus'),
      dataIndex: 'connectStatus',
      key: 'connectStatus',
      width: 100,
    },
    {
      title: t('sys.ipaas.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: t('sys.ipaas.accessTime'),
      dataIndex: 'accessTime',
      key: 'accessTime',
      ellipsis: true,
      width: 180,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
    },
  ];

  const setDefaultTimeRange = () => {
    // 获取当前日期时间
    const now = dayjs();
    // 获取一个月前的日期时间
    const oneMonthAgo = now.subtract(1, 'month').startOf('day');
    // 获取一个月前的开始时间（即一个月前的00:00:00）
    const startOfOneMonthAgo = oneMonthAgo.startOf('day');
    // 获取当前日期时间的结束时间（即今天的23:59:59）
    const endOfNow = now.endOf('day');
    // 格式化日期时间
    const startTime = startOfOneMonthAgo.format('YYYY-MM-DD HH:mm:ss');
    const endTime = endOfNow.format('YYYY-MM-DD HH:mm:ss');
    formState.startTime = startTime;
    formState.endTime = endTime;
  };

  onMounted(async () => {
    setDefaultTimeRange();
    getTableData();
  });

  watch(
    () => props.activeKey,
    () => {
      if (props.activeKey === props.tabKey) {
        getTableData();
      }
    },
  );

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await postConnectorLogPageList(
      {
        ...formState,
      },
      {
        pageNo,
        pageSize: pagination.pageSize,
      },
    ).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
    // 查询时重置选中
    resetSelectedRowKeys();
  };
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleView = (record) => {
    GctDialog.open(ConnectionLogModal, {
      context: record,
      options: {
        title: t('sys.viewDetails'),
      },
    });
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

  /**
   * 清空测试接口
   */
  const deleteTest = () => {
    Modal.confirm({
      title: t('sys.tip'),
      icon: createVNode(ExclamationCircleOutlined),
      content: t('sys.ipaas.clearTestLogsWarning'),
      async onOk() {
        await deleteConnectorLog();
        message.success(t('sys.delSuccess'));
        getTableData(1);
      },
    });
  };

  const onReset = () => {
    formRef.value?.resetFields();
    formState.startTime = undefined;
    formState.endTime = undefined;
    getTableData();
  };
</script>

<style lang="less" scoped>
  .connect-status {
    &.SUCCESS {
      color: var(--ant-success-color);
    }

    &.FAILURE {
      color: var(--ant-error-color);
    }
  }
</style>
