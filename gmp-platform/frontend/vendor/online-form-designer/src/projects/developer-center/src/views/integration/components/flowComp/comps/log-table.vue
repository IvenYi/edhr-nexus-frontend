<template>
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
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'status'">
        <span
          :class="[
            'tag-status',
            { 'success-tag': record.status === '2' },
            { 'error-tag': record.status === '3' },
          ]"
        >
          {{ record.statusStr }}
        </span>
      </template>
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.detail'),
              onClick: () => {
                openDetailModal(record.reqId);
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
  import { ref, reactive } from 'vue';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postFlowLogPageSearch } from '/@/apis/gct-ipaas/IpaasLogController';
  import { FlowLogSearchReq } from '/@/apis/gct-ipaas/model';
  import LogDetail from '../../modal/log-detail.vue';

  const props = defineProps<{
    params: FlowLogSearchReq;
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
    const res = await postFlowLogPageSearch(
      {
        ...props.params,
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

  const openDetailModal = async (id) => {
    await gct.openUtil.modal(
      LogDetail,
      {
        id,
      },
      {
        title: t('sys.detail'),
        width: 640,
        minHeight: 250,
        showFooter: false,
        okText: t('sys.okText'),
      },
    );
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.nameOfSth', { sth: t('sys.ipaas.connectionFlow') }),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.keyOfSth', { sth: t('sys.ipaas.connectionFlow') }),
      dataIndex: 'ckey',
      key: 'ckey',
      ellipsis: true,
    },
    {
      title: t('sys.integration.callType'),
      dataIndex: 'triggerTpye',
      key: 'triggerTpye',
      ellipsis: true,
    },
    {
      title: `${t('sys.integration.timeConsuming')} (ms)`,
      dataIndex: 'processTime',
      key: 'processTime',
      ellipsis: true,
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('sys.integration.executionTime'),
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      ellipsis: true,
    },

    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
    },
  ];

  defineExpose({ getTableData });
</script>
<style lang="less" scoped>
  .tag-status {
    padding: 3px 6px;
    border-radius: 4px;

    &.success-tag {
      color: #309c41;
      background-color: #def8e2;
    }
    &.error-tag {
      color: #f54547;
      background-color: #feecec;
    }
  }
</style>
