<template>
  <a-table
    row-key="id"
    :columns="conflictColumns"
    :data-source="mergePreviewData.conflictDetails ?? []"
    bordered
    :pagination="false"
    :loading="loading"
    size="middle"
    :scroll="{
      y: '45vh',
    }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'actions'">
        <a v-if="resolve" @click.stop="() => handleResolve(record)">{{ t('解决') }}</a>
        <a v-else @click.stop="() => handleView(record)">{{ t('sys.view') }}</a>
      </template>
    </template>
  </a-table>
  <version-merge-diff-modal @register="register" :readonly="!resolve" @choose="handleChoose" />
</template>

<script setup lang="ts">
  import { computed, inject, unref } from 'vue';
  import type { MergePreviewResponse } from '/@/apis/gct-platform/model';
  import type { TableColumnsType } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import VersionMergeDiffModal from '../modal/version-merge-diff-modal.vue';
  import { useModal } from '/@/components/Modal';

  const isImport = inject('isImport');

  const props = defineProps<{
    mergePreviewData: MergePreviewResponse;
    loading?: boolean;
    resolve?: boolean;
  }>();

  // const emit = defineEmits(['resolve', 'view']);

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const conflictColumns = computed(() => {
    const cols: TableColumnsType = [
      {
        title: t('源冲突内容'),
        dataIndex: 'sourceOpeDesc',
      },
      {
        title: t('源提交标识'),
        dataIndex: 'sourceCommitTag',
      },
      {
        title: t('目标冲突内容'),
        dataIndex: 'targetOpeDesc',
      },
      {
        title: t('目标提交标识'),
        dataIndex: 'targetCommitTag',
      },
      {
        title: t('结果'),
        dataIndex: 'choice',
        customRender: ({ text }) => {
          if (!text) return '';
          let i18nKey = 'sys.app.';
          i18nKey += (text as string).toLowerCase();
          i18nKey += unref(isImport) ? 'Branch' : 'Version';
          return t(i18nKey);
        },
      },
      {
        align: 'center',
        title: t('操作'),
        dataIndex: 'actions',
        key: 'actions',
      },
    ];
    return cols;
  });

  const handleResolve = (record) => {
    openModal(true, record);
  };

  const handleView = (record) => {
    openModal(true, record);
  };

  const handleChoose = (result, { tableName, pkValue }) => {
    const data = props.mergePreviewData.conflictDetails?.find(
      (item) => item.tableName === tableName && item.pkValue === pkValue,
    );
    if (data) {
      data.choice = result;
    }
  };
</script>

<style lang="less" scoped></style>
