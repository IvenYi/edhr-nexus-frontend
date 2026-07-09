<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('合并记录')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    :footer="null"
  >
    <div class="mb-10px">
      <a-input
        class="important-w-200px mr-10px"
        placeholder="按备注搜索"
        v-model:value="formState.keyword"
        allow-clear
      />
      <a-button class="mr-10px" type="primary" @click="() => getTableData(1)">
        <template #icon>
          <search-outlined />
        </template>
        {{ t('sys.queryText') }}
      </a-button>
    </div>

    <a-table
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
      :scroll="{
        y: '45vh',
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a @click.stop="() => handleDetail(record)">{{ t('sys.detail') }}</a>
        </template>
      </template>
    </a-table>
  </basic-modal>
  <version-merge-detail-modal @register="register" />
</template>

<script setup lang="ts">
  import { reactive, ref, inject, ComputedRef } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { getAppMergePageListByAppId } from '/@/apis/gct-platform/AppController';
  import type { MergeLogResponse } from '/@/apis/gct-platform/model';
  import VersionMergeDetailModal from './version-merge-detail-modal.vue';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const isImport: ComputedRef<boolean> | undefined = inject('isImport');

  const [registerInner] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, data);
    getTableData();
  });

  const columns: TableColumnsType = [
    {
      title: isImport?.value ? t('sys.app.branch.source') : t('sys.app.version.source'),
      dataIndex: 'sourceAppVersion',
      customRender: ({ text, record }) => {
        return isImport?.value ? record.sourceBranchSeq : text;
      },
    },
    {
      title: isImport?.value ? t('sys.app.branch.target') : t('sys.app.version.target'),
      dataIndex: 'targetAppVersion',
      customRender: ({ text, record }) => {
        return isImport?.value ? record.targetBranchSeq : text;
      },
    },
    {
      title: t('sys.notes'),
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      width: 170,
    },
    {
      align: 'center',
      width: 80,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const formState: { appId: string; keyword?: string } = reactive({
    appId: '',
    keyword: undefined,
  });
  const loading = ref<boolean>(false);
  const tableData = ref<MergeLogResponse[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getAppMergePageListByAppId(
      {
        appId: formState.appId,
      },
      {
        keyword: formState.keyword?.trim(),
        pageNo,
        pageSize: pagination.pageSize,
      },
    ).finally(() => {
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

  const handleClose = () => {
    Object.assign(formState, {
      appId: '',
      keyword: undefined,
    });
    tableData.value = [];
  };

  const handleDetail = (record) => {
    openModal(true, {
      appId: formState.appId,
      id: record.id,
    });
  };
</script>

<style lang="less"></style>
