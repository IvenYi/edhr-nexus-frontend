<template>
  <div class="h-full flex flex-col p24px">
    <div class="text-right">
      <a-button type="primary">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.new') }}
      </a-button>
    </div>

    <a-table
      class="flex-1 h-100px mt-16px"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
      ref="tableContainerRef2"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column }">
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                onClick: () => {},
              },
              {
                label: t('sys.delete'),
                type: 'info',
                onClick: () => {},
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
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';

  const { t } = useI18n();

  const tableContainerRef2 = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef2);

  const loading = ref<boolean>(false);
  const tableData = ref<any[]>([{ id: 1, name: 123 }]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    // loading.value = true;
    // const res = await getDataSourcePageList({
    //   ...formState,
    //   pageNo,
    //   pageSize: pagination.pageSize,
    // }).finally(() => {
    //   loading.value = false;
    // });
    // pagination.current = res?.pageNo;
    // pagination.total = res?.totalCount;
    // tableData.value = res?.data ?? [];
  };
  getTableData();
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.integration.accountType'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.integration.accountName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.integration.associatedQty'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
    },
    {
      title: t('sys.integration.lastUseTime'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
    },

    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
    },
  ];
</script>

<style></style>
