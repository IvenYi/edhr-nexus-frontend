<template>
  <a-table
    row-key="id"
    :columns="columns"
    :data-source="mergePreviewData.sourceCommitLogs ?? []"
    bordered
    :pagination="false"
    :loading="loading"
    size="middle"
    :scroll="{
      y: '45vh',
    }"
  />
</template>

<script setup lang="ts">
  import type { MergePreviewResponse } from '/@/apis/gct-platform/model';
  import type { TableColumnsType } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    mergePreviewData: MergePreviewResponse;
    loading?: boolean;
    resolve?: boolean;
  }>();

  const { t } = useI18n();

  const columns: TableColumnsType = [
    {
      title: t('提交标识'),
      dataIndex: 'tag',
    },
    {
      title: t('提交内容'),
      dataIndex: 'description',
    },
    {
      title: t('提交人'),
      dataIndex: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('提交时间'),
      dataIndex: 'createTime',
      width: 170,
    },
  ];
</script>

<style lang="less" scoped></style>
