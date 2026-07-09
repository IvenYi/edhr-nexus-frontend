<template>
  <basic-page>
    <div class="h-full p-20px flex flex-col">
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
  } from '/@/apis/gct-platform/PublishedAppController';
  import type { PublishedAppDtoResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();
  const go = useGo();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const formRef = ref<FormInstance>();
  const formState: getReleasedAppPublishedAppListQueryInterface = reactive({
    name: undefined,
    key: undefined,
    env: 'prod',
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
      title: t('sys.app.releaseTag'),
      dataIndex: 'releaseTag',
      key: 'releaseTag',
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
    go(`/env/prod/${record.id}/${record.appId}`);
  };
</script>

<style lang="less" scoped></style>
