<template>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane :key="MergeVersionTabEnum.Commit" :tab="commitTabName">
      <merge-tab-commit :merge-preview-data="mergePreviewData" :loading="loading" />
    </a-tab-pane>
    <a-tab-pane :key="MergeVersionTabEnum.Conflict" :tab="conflictTabName">
      <merge-tab-conflict
        :merge-preview-data="mergePreviewData"
        :resolve="resolve"
        :loading="loading"
      />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { MergePreviewResponse } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import MergeTabCommit from './merge-tab-commit.vue';
  import MergeTabConflict from './merge-tab-conflict.vue';

  enum MergeVersionTabEnum {
    Commit,
    Conflict,
  }

  const props = defineProps<{
    mergePreviewData: MergePreviewResponse;
    loading?: boolean;
    resolve?: boolean;
  }>();

  const { t } = useI18n();

  const activeTab = ref<MergeVersionTabEnum>(MergeVersionTabEnum.Commit);
  const commitTabName = computed(() => {
    const length = props.mergePreviewData.sourceCommitLogs?.length ?? 0;
    return t('提交记录') + (length > 0 ? `(${length})` : '');
  });
  const conflictTabName = computed(() => {
    const length = props.mergePreviewData.conflictDetails?.length ?? 0;
    return t('改动冲突') + (length > 0 ? `(${length})` : '');
  });
</script>

<style lang="less" scoped>
  .ant-tabs {
    :deep(.ant-tabs-nav) {
      padding-left: 20px;
    }
    :deep(.ant-tabs-tabpane) {
      padding: 0 20px 20px;
    }
  }
</style>
