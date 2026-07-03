<template>
  <basic-page-render>
    <div class="flex flex-col h-full p-16px">
      <div class="content-top bg-[#F7F8FA] p16px mb16px">
        <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
          <a-row :gutter="[16, 16]">
            <a-col :lg="8" :xxxl="6">
              <a-form-item :label="t('sys.edhr.printType')" name="relationType">
                <a-select
                  v-model:value="formState.relationType"
                  allow-clear
                  :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.type') })"
                  :options="PrintTypeOptions"
                />
              </a-form-item>
            </a-col>

            <a-col :lg="8" :xxxl="6">
              <a-form-item :label="t('sys.edhr.lotOrSn')" name="materialNo">
                <a-input
                  v-model:value="formState.materialNo"
                  :max-length="32"
                  allow-clear
                  :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.lotOrSn') })"
                />
              </a-form-item>
            </a-col>

            <a-col :lg="8" :xxxl="6">
              <a-form-item :label="t('sys.name')" name="name">
                <a-input
                  v-model:value="formState.name"
                  :max-length="32"
                  allow-clear
                  :placeholder="t('sys.inputTextTip', { name: t('sys.name') })"
                />
              </a-form-item>
            </a-col>

            <a-col :lg="8" :xxxl="6">
              <a-form-item :label="t('sys.edhr.taskName')" name="formTaskName">
                <a-input
                  v-model:value="formState.formTaskName"
                  :max-length="32"
                  allow-clear
                  :placeholder="t('sys.inputTextTip', { name: t('sys.edhr.taskName') })"
                />
              </a-form-item>
            </a-col>

            <a-col :lg="{ span: 8, offset: 8 }" :xxxl="{ span: 6, offset: 18 }">
              <div class="float-right">
                <a-button class="mr-10px" @click="handleReset">
                  {{ t('sys.reset') }}
                </a-button>
                <a-button type="primary" @click="() => getTableData(1)">
                  {{ t('sys.queryText') }}
                </a-button>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-table
        class="gct-edhr-table flex-1 h-100px"
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
          <!-- <template v-if="column.key === 'instanceStatus'">
            <InstanceStatusTag :text="record.instanceStatus" />
          </template> -->

          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.download'),
                  onClick: () => handleDownload(record),
                  ifShow: record.status === PrintStatusEnum.SUCCEED,
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { SerialNumberColumn } from '../../constants';
  import type { FileTaskResponse } from '/@/apis/gct-platform/model';
  import {
    getFileTaskPageList,
    getFileTaskPageListQueryInterface,
  } from '/@/apis/gct-platform/FileTaskController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { downloadByUrl } from '/@/utils/file/download';

  const { t } = useI18n();

  enum PrintTypeEnum {
    EDHR = 'EDHR',
    FORM = 'FORM',
  }

  enum PrintStatusEnum {
    WAITING = 'WAITING',
    PROCESSING = 'PROCESSING',
    TIMEOUT = 'TIMEOUT',
    SUCCEED = 'SUCCEED',
    FAIL = 'FAIL',
  }

  /** 放行状态 */
  const PrintTypeOptions = Object.keys(PrintTypeEnum).map((item) => {
    return {
      label: t('sys.edhr.printTypeEnum.' + item),
      value: item,
    };
  });

  const columns: TableColumnsType = [
    SerialNumberColumn.value,
    {
      title: t('sys.edhr.printType'),
      dataIndex: 'relationType',
      key: 'relationType',
      ellipsis: true,
      width: 120,
      customRender: ({ text }) => {
        return t(`sys.edhr.printTypeEnum.${text}`);
      },
    },
    {
      title: t('sys.edhr.lotOrSn'),
      dataIndex: 'materialNo',
      key: 'materialNo',
      ellipsis: true,
      width: 240,
    },
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 240,
    },
    {
      title: t('sys.edhr.taskName'),
      dataIndex: 'formTaskName',
      key: 'formTaskName',
      ellipsis: true,
      width: 240,
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 120,
      customRender: ({ text }) => {
        return t(`sys.edhr.printStatusEnum.${text}`);
      },
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
    },
  ];

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const formState = reactive<getFileTaskPageListQueryInterface>({
    name: undefined,
    formTaskName: undefined,
    pageNo: undefined,
    pageSize: undefined,
    relationType: undefined,
    status: undefined,
    materialNo: undefined,
  });

  const formRef = ref<FormInstance>();

  const loading = ref<boolean>(false);
  const tableData = ref<FileTaskResponse[]>([]);

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  // 未结束状态定时器
  let _timer: any = null;
  const _clearTimer = () => {
    _timer && clearTimeout(_timer);
    _timer = null;
  };
  const _setTimer = () => {
    _clearTimer;
    _timer = setTimeout(() => {
      getTableData();
    }, 30 * 1000);
  };
  const getTableData = async (pageNo: number = pagination.current!) => {
    _clearTimer();
    const usePathQuery = usePathQueryStore();
    loading.value = true;
    const res = await getFileTaskPageList(
      {
        ...formState,
        pageNo,
        pageSize: pagination.pageSize,
      },
      { transferToConfig: { headers: { 'App-Tag': usePathQuery.getAid() } } },
    ).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];

    if (
      tableData.value.find((item) =>
        [PrintStatusEnum.WAITING, PrintStatusEnum.PROCESSING].includes(
          item.status as PrintStatusEnum,
        ),
      )
    ) {
      _setTimer();
    }
  };

  onMounted(async () => {
    getTableData();
  });

  onBeforeUnmount(() => {
    _clearTimer();
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    getTableData(1);
  };

  const handleDownload = (record: FileTaskResponse) => {
    downloadByUrl({
      url: `/minio/${record.appId}/${record.url}`,
    });
  };
</script>

<style scoped></style>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
