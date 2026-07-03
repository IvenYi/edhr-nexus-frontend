<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.detail')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :footer="null"
  >
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="false"
      :loading="loading"
      size="middle"
      :scroll="{
        y: '45vh',
      }"
    />
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCommitLogViewDetail } from '/@/apis/gct-apaas/CommitLogController';
  import type { TableColumnsType } from 'ant-design-vue';

  const { t } = useI18n();
  const [registerInner] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, data);
    getTableData();
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.operation'),
      dataIndex: 'opeDesc',
      key: 'opeDesc',
    },
    {
      title: t('操作人'),
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
      ellipsis: true,
    },
    {
      title: t('操作时间'),
      dataIndex: 'opeTime',
      key: 'opeTime',
      width: 180,
    },
  ];

  const formState: { commitId?: string } = reactive({
    commitId: undefined,
  });
  const tableData = ref<any[]>([]);
  const loading = ref<boolean>(false);

  const getTableData = async () => {
    const res = await getCommitLogViewDetail(formState as any);
    tableData.value = res ?? [];
  };

  const handleClose = () => {
    formState.commitId = undefined;
    tableData.value = [];
  };
</script>

<style lang="less"></style>
