<template>
  <div class="h-full flex flex-col p16px">
    <a-table
      class="flex-1 h-100px"
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
    />
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFlowOnlineByFuuid } from '/@/apis/gct-ipaas/IpaasLogController';

  const props = defineProps<{
    flowId: string | undefined;
  }>();

  const { t } = useI18n();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

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

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getFlowOnlineByFuuid(
      {
        fuuid: props.flowId,
      },
      { pageNo, pageSize: pagination.pageSize },
    ).finally(() => {
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
      title: t('sys.typeOfSth', { sth: t('sys.operation') }),
      dataIndex: 'actionStr',
      key: 'actionStr',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.version'),
      dataIndex: 'version',
      key: 'version',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.operator'),
      dataIndex: 'actionUser',
      key: 'actionUser',
    },
    {
      title: t('sys.ipaas.operateTime'),
      dataIndex: 'actionTime',
      key: 'actionTime',
      ellipsis: true,
    },
  ];
</script>
<style lang="less" scoped></style>
