<template>
  <div class="h-full">
    <div class="h-full flex flex-col">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item :label="t('sys.integration.flowKey')" name="key">
              <a-input
                v-model:value="formState.key"
                :max-length="32"
                allow-clear
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item :label="t('sys.integration.flowName')" name="name">
              <a-input
                v-model:value="formState.name"
                :max-length="32"
                allow-clear
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>

          <!-- <a-col v-show="!isApp" :span="6">
            <a-form-item label="所属应用" name="appId">
              <a-select v-model:value="formState.appId" allow-clear>
                <a-select-option v-for="item in categories" :key="item.id" :value="item.id">
                  {{ item.nameStr }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item label="调用方式" name="triggerType">
              <a-select v-model:value="formState.triggerType" allow-clear>
                <a-select-option v-for="item in triggerTypes" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
          <a-col :span="6">
            <a-form-item :label="t('sys.integration.callResult')" name="status">
              <a-select
                v-model:value="formState.status"
                allow-clear
                :placeholder="t('sys.chooseText')"
              >
                <a-select-option v-for="item in FlowCallLogStatusEnum" :key="item" :value="item">
                  {{ t('sys.ipaas.flowCallLogStatus.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="t('sys.appDesigner.inputContent')" name="inputPayload">
              <a-input
                v-model:value="formState.inputPayload"
                :max-length="32"
                allow-clear
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="t('sys.appDesigner.outContent')" name="outputPayload">
              <a-input
                v-model:value="formState.outputPayload"
                :max-length="32"
                allow-clear
                :placeholder="t('sys.inputText')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6" :offset="12">
            <div style="text-align: right">
              <a-form-item>
                <a-button class="mr-10px" @click="reset">
                  {{ t('sys.reset') }}
                </a-button>
                <a-button type="primary" @click="() => getTableData(1)">
                  {{ t('sys.queryText') }}
                </a-button>
              </a-form-item>
            </div>
          </a-col>
        </a-row>
      </a-form>

      <!-- <div class="flex-none mb-16px">
        <a-button :disabled="selectedRowKeys.length === 0" danger @click="handleBatchExport">
          批量导出
        </a-button>
      </div> -->

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
          <template v-if="column.key === 'status'">
            <span class="log-status" :class="'log-status--' + record.status">
              {{ t('sys.ipaas.flowCallLogStatus.' + record.status) }}
            </span>
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="
                record.retry
                  ? [
                      {
                        ifShow: userActions.Recall,
                        label: t('sys.integration.reCall'),
                        disabled: record.status == '1',
                        onClick: () => handleView(record, 'reStart'),
                      },
                      {
                        label: t('sys.viewDetails'),
                        onClick: () => handleView(record),
                      },
                    ]
                  : [
                      {
                        label: t('sys.viewDetails'),
                        onClick: () => handleView(record),
                      },
                    ]
              "
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>

    <FlowCallLogModal ref="FlowCallLogModalRef" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { GctDialog } from '/@/utils/Dialog';
  import { FlowCallLogStatusEnum } from '/@ipaas/enums';
  // import ConnectionLogModal from './connection-log-modal.vue';
  import { getFlowInvokeMethods } from '/@/apis/gct-ipaas/IpaasLogController';
  import type { CategoryResp } from '/@/apis/gct-ipaas/model';
  import { getCategories } from '/@/apis/gct-ipaas/IpaasCategoryController';
  import { useGo } from '/@/hooks/web/usePage';
  import FlowCallLogModal from './flow-call-log-modal.vue';
  import { offset } from '@floating-ui/dom';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import {
    getFlowLogPageSearch,
    getFlowLogPageSearchQueryInterface,
  } from '/@/apis/gct-ipaas2/FlowLogController';
  import type { FlowLogResp } from '/@/apis/gct-ipaas2/model';
  import { getRuntimeRetry } from '/@/apis/gct-ipaas2/RunTimeController';

  type Key = string | number;

  const props = defineProps<{
    tabKey: string | number;
    activeKey: string | number;
    userActions: { [key: string]: boolean };
  }>();

  const formState: Partial<getFlowLogPageSearchQueryInterface> = reactive({
    key: undefined,
    name: undefined,
    appId: undefined,
    triggerType: undefined,
    status: undefined,
    inputPayload: undefined, // 输入报文-payload
    outputPayload: undefined, // 输出报文-payload
  });

  const { appInfo } = useAppInfoStore();
  const formRef = ref<FormInstance>();
  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const { t } = useI18n();
  const go = useGo();

  const selectedRowKeys = ref<Key[]>([]);
  const loading = ref<boolean>(false);
  const tableData = ref<FlowLogResp[]>([]);
  const triggerTypes = ref<string[]>([]);
  const categories = ref<CategoryResp[]>([]);
  const FlowCallLogModalRef = ref();

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
      title: t('sys.integration.flowKey'),
      dataIndex: 'modelKey',
      key: 'modelKey',
      ellipsis: true,
    },
    {
      title: t('sys.integration.flowName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.integration.callVersion'),
      dataIndex: 'version',
      key: 'version',
      width: 120,
    },
    {
      title: t('sys.integration.callTime'),
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.integration.callResult'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
    },
  ];

  const isApp = computed(() => {
    return !!appInfo?.id;
  });

  const getTriggerTypes = () => {
    getFlowInvokeMethods().then((res) => {
      triggerTypes.value = res ?? [];
    });
  };
  const getAppCategories = () => {
    getCategories().then((res) => {
      categories.value = res ?? [];
    });
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getFlowLogPageSearch({
      ...formState,
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

  onMounted(async () => {
    getTableData();
    getAppCategories();
    getTriggerTypes();
  });

  watch(
    () => props.activeKey,
    () => {
      if (props.activeKey === props.tabKey) {
        getTableData();
      }
    },
  );

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleBatchExport = () => {};
  const handleExport = (record) => {};

  const handleView = async (record: FlowLogResp, type?: string) => {
    if (type) {
      try {
        await getRuntimeRetry({ reqId: record.reqId });
        // getTableData();
        setTimeout(async () => {
          await getTableData(1);
          message.info(t('sys.integration.reCallSuccessTip'));
        }, 100);
      } catch (e) {
        console.log(e);
      }
    } else {
      FlowCallLogModalRef.value.open({
        reqId: record.reqId,
      });
    }
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

  const reset = () => {
    formRef.value?.resetFields();
    getTableData(1);
  };
</script>

<style lang="less" scoped>
  .log-status {
    &--2 {
      color: var(--ant-success-color);
    }

    &--3 {
      color: var(--ant-error-color);
    }
  }
</style>
