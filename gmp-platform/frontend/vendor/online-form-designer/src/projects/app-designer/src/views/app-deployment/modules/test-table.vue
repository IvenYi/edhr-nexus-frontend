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
      <template v-if="column.key === 'commitTag'">
        <div class="flex items-center">
          <span class="mr-8px" style="line-height: 1em">{{ record.commitTag }}</span>
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
            {
              label: t('创建发行'),
              onClick: () => handleRelease(record),
              ifShow: record.canCreateRelease === true,
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>
  <publish-detail-modal @register="register" />
</template>

<script setup lang="tsx">
  import { ref, reactive, inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useModal } from '/@/components/Modal';
  import PublishDetailModal from '../modals/publish-detail-modal.vue';
  import { getPublishLogPageList } from '/@/apis/gct-apaas/PublishLogController';
  import { PublishLogResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const openReleaseModal = inject('openReleaseModal') as Function;

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const loading = ref<boolean>(false);
  const tableData = ref<PublishLogResponse[]>([]);
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
    const res = await getPublishLogPageList({
      appEnv: 'test',
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
      title: t('sys.app.commitTag'),
      dataIndex: 'commitTag',
      key: 'commitTag',
      width: 240,
    },
    {
      title: t('sys.status'),
      dataIndex: 'state',
      customRender: ({ text }) => {
        return t('sys.app.publish.' + text);
      },
    },
    {
      title: t('sys.publishBy'),
      dataIndex: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('sys.publishTime'),
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 170,
    },
  ];

  const handleDetail = (record) => {
    openModal(true, {
      env: 'test',
      payload: { ...record },
    });
  };
  const handleRelease = ({ commitTag }) => {
    openReleaseModal(true, {
      commitTag,
    });
  };

  defineExpose({
    getTableData,
  });
</script>

<style lang="less" scoped></style>
