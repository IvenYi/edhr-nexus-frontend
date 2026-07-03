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
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.editor.recover'),
              popConfirm: {
                title: t('sys.model.modelRecoverMessage'),
                confirm: () => handleRecover(record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import {
    getModelMetaPageGetRecycledList,
    putModelMetaPageRecycledRestoreByModelKey,
  } from '/@/apis/gct-apaas/ModelMetaController';
  import type { ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { TableActionAuto } from '/@/components/Table';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const loading = ref<boolean>(false);
  const tableData = ref<ModelMetaResponse[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  onMounted(() => {
    getTableData();
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getModelMetaPageGetRecycledList({
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res!.totalCount;
    tableData.value = res!.data ?? [];
  };
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('模型名称'),
      dataIndex: 'name',
    },
    {
      title: t('模型KEY'),
      dataIndex: 'key',
    },
    {
      title: t('模型类型'),
      dataIndex: 'type',
      customRender: ({ text }) => {
        return t('sys.model.' + text);
      },
    },
    {
      title: t('sys.description'),
      dataIndex: 'description',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleRecover = (record: ModelMetaResponse) => {
    putModelMetaPageRecycledRestoreByModelKey({
      modelKey: record.key!,
    }).then(() => {
      createMessage.success(t('sys.operationSuccess'));
      getTableData(1);
    });
  };
</script>

<style lang="less" scoped></style>
