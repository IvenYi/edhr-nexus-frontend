<template>
  <basic-page>
    <div class="env-test__header">
      <span>{{ t('sys.app.testDomainName') }}：</span>
      <span>{{ testDomain }}</span>
    </div>

    <div class="p-20px flex flex-col">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off" layout="inline">
        <div class="w-full">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :label="t('sys.nameOfSth', { sth: t('sys.app.index') })" name="appName">
                <a-input v-model:value="formState.appName" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.app.id')" name="appId">
                <a-input v-model:value="formState.appId" />
              </a-form-item>
            </a-col>
            <a-col :span="8" style="text-align: right">
              <a-button @click="() => formRef?.resetFields()">
                <template #icon>
                  <undo-outlined />
                </template>
                {{ t('sys.reset') }}
              </a-button>
              <a-button class="ml-10px" type="primary" @click="() => getTableData(1)">
                <template #icon>
                  <search-outlined />
                </template>
                {{ t('sys.queryText') }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </a-form>

      <a-table
        class="flex-1 h-100px mt-14px"
        row-key="id"
        :columns="columns"
        :data-source="tableData"
        bordered
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
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.detail'),
                  onClick: () => handleDetail(record),
                },
                {
                  label: t('sys.remove'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToRemove'),
                    confirm: () => handleRemove(record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useGo } from '/@/hooks/web/usePage';
  import {
    getReleasedAppPublishedAppList,
    getReleasedAppPublishedAppListQueryInterface,
    deleteReleasedAppDeletePublishedAppByTestId,
  } from '/@/apis/gct-platform/PublishedAppController';
  import type { PublishedAppDtoResponse } from '/@/apis/gct-platform/model';
  import { getTenantInfoById } from '/@/apis/gct-platform/TenantController';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { message } from 'ant-design-vue';

  const { t } = useI18n();
  const go = useGo();
  const userStore = useUserStoreWithOut();

  const testDomain = ref<string>('');
  getTenantInfoById({
    id: userStore.getTenant as unknown as string,
  }).then((res) => {
    if (!res?.domainPrefix) return;
    const url =
      process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOBAL_HOST : location.origin;
    const prefix = url.split('//')[0] + '//';
    const suffix = url.substr(url.indexOf('.', url.indexOf('.')));
    testDomain.value = `${prefix}${res?.domainPrefix}-test${suffix}`;
  });

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const formRef = ref<FormInstance>();
  const formState: getReleasedAppPublishedAppListQueryInterface = reactive({
    appId: undefined,
    appName: undefined,
    env: 'test',
  });
  const loading = ref<boolean>(false);
  const tableData = ref<PublishedAppDtoResponse[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getReleasedAppPublishedAppList({
      ...formState,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };
  getTableData();
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.app.index') }),
      dataIndex: 'appName',
      key: 'appName',
      ellipsis: true,
    },
    {
      title: t('sys.app.id'),
      dataIndex: 'appId',
      key: 'appId',
      ellipsis: true,
    },
    {
      title: t('sys.app.commitTag'),
      dataIndex: 'commitTag',
      key: 'commitTag',
      ellipsis: true,
    },
    {
      title: t('sys.app.version.index'),
      dataIndex: 'appVersion',
      key: 'appVersion',
    },
    {
      title: t('sys.app.lastAccessTime'),
      dataIndex: 'lastVisitTime',
      key: 'lastVisitTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.app.publishBy'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
    },
    {
      title: t('sys.app.publishTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },

    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 130,
    },
  ];

  const handleDetail = (record: PublishedAppDtoResponse) => {
    go(`/env/test/${record.id}/${record.appId}`);
  };
  /**
   * 测试环境应用移除
   * @param record
   */
  const handleRemove = async (record: PublishedAppDtoResponse) => {
    await deleteReleasedAppDeletePublishedAppByTestId({
      id: record.id!,
    });
    message.success(t('sys.operationSuccess'));
    getTableData();
  };
</script>

<style lang="less" scoped>
  .env-test {
    &__header {
      height: 50px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eaeaea;

      & > span:nth-child(1) {
        color: #999;
      }
      & > span:nth-child(2) {
        color: #333;
      }

      & + div {
        height: calc(100% - 50px);
        padding: 20px;
      }
    }
  }
</style>
