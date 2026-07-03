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
      <template v-if="column.key === 'tag'">
        <div class="flex items-center">
          <span class="mr-8px" style="line-height: 1em">{{ record.tag }}</span>
          <a-tag color="warning" v-if="record.releaseTag"> 已发行 </a-tag>
        </div>
      </template>
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
  <commit-detail-modal @register="register" />
</template>

<script setup lang="tsx">
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useModal } from '/@/components/Modal';
  import CommitDetailModal from '../modals/commit-detail-modal.vue';
  import { getCommitLogPageList } from '/@/apis/gct-apaas/CommitLogController';
  import { CommitLogResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const loading = ref<boolean>(false);
  const tableData = ref<CommitLogResponse[]>([]);
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
    const res = await getCommitLogPageList({
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };
  getTableData();
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.app.commitTag'),
      dataIndex: 'tag',
      key: 'tag',
      width: 240,
    },
    {
      title: t('sys.app.commitContent'),
      dataIndex: 'description',
      key: 'description',
      customRender: ({ text }) => {
        return (
          <div class="line-clamp-2" title={text}>
            {text}
          </div>
        );
      },
    },
    {
      title: t('sys.submitBy'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('sys.submitTime'),
      dataIndex: 'createTime',
      key: 'createTime',
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
      commitId: record.id,
    });
  };

  defineExpose({
    getTableData,
  });
</script>

<style lang="less" scoped></style>
