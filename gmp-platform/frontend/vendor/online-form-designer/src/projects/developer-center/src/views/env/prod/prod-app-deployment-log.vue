<template>
  <a-table
    class="h-full"
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
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('回退上一版本'),
              ifShow:
                record.reverted !== 1 &&
                index === 0 &&
                pagination.current === 1 &&
                pagination.total! > 1,
              popConfirm: {
                title: t('回退上一版本'),
                confirm: () => handleRevert(record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>
</template>
<script setup lang="ts" name="deployment-log">
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import type { PublishLogResponse } from '/@/apis/gct-platform/model';
  import {
    getAppPublishLogPageListByAppId,
    postAppRevertByAppId,
  } from '/@/apis/gct-platform/AppController';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { TableActionAuto } from '/@/components/Table';
  import { message } from 'ant-design-vue';

  interface Props {
    appId: string;
    env: 'test' | 'prod';
  }

  const props = defineProps<Props>();

  // 定义事件
  const emits = defineEmits<{
    (e: 'revertSuccess'): void;
  }>();

  const { t } = useI18n();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const loading = ref<boolean>(false);
  const tableData = ref<Array<PublishLogResponse>>([]);
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
      title: t('发行标识'),
      dataIndex: 'releaseTag',
    },
    {
      title: t('发布内容'),
      dataIndex: 'description',
    },
    {
      title: t('发布人'),
      dataIndex: 'createUserName',
    },
    {
      title: t('发布时间'),
      dataIndex: 'createTime',
    },
    {
      width: 200,
      title: t('sys.operation'),
      key: 'actions',
    },
  ];

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getAppPublishLogPageListByAppId(
      {
        appId: props.appId,
      },
      {
        appEnv: props.env,
        pageNo,
        pageSize: pagination.pageSize,
        state: 'SUCCESS',
      },
    ).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res!.totalCount;
    tableData.value = res!.data ?? [];
  };
  getTableData();
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleRevert = async (record: PublishLogResponse) => {
    await postAppRevertByAppId(
      {
        appId: props.appId,
      },
      {
        appId: props.appId,
        publishId: record.id,
      },
    );
    message.success(t('sys.operationSuccess'));
    emits('revertSuccess');
    getTableData();
  };
</script>
