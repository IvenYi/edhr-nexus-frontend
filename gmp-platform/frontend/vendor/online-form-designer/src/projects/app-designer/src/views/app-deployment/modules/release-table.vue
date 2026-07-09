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
              label: t('sys.detail'),
              onClick: () => handleDetail(record),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>
  <release-detail-modal @register="register" />
</template>

<script setup lang="tsx">
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { getCommitLogReleasePageList } from '/@/apis/gct-apaas/CommitLogController';
  import ReleaseDetailModal from '../modals/release-detail-modal.vue';
  import { useModal } from '/@/components/Modal';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

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
    const res = await getCommitLogReleasePageList({
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
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

  const columns: TableColumnsType = [
    {
      title: t('sys.app.releaseTag'),
      dataIndex: 'releaseTag',
      key: 'releaseTag',
    },
    {
      title: t('sys.app.releaseContent'),
      dataIndex: 'releaseContent',
      key: 'releaseContent',
      customRender: ({ text }) => {
        return (
          <div class="line-clamp-2" title={text}>
            {text}
          </div>
        );
      },
    },
    {
      title: t('sys.app.releaseBy'),
      dataIndex: 'releaseUserName',
      key: 'releaseUserName',
      ellipsis: true,
    },
    {
      title: t('sys.app.releaseTime'),
      dataIndex: 'releaseTime',
      key: 'releaseTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 100,
    },
  ];

  const handleDetail = (record) => {
    openModal(true, {
      ...record,
    });
  };

  defineExpose({
    getTableData,
  });
</script>

<style lang="less" scoped></style>
