<template>
  <div v-if="draft" class="app-draft-state">
    {{ t('草稿') }}
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onBeforeUnmount } from 'vue';
  import { useAppDraftState } from './useAppDraftState';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { draft, getDraft, getDraftTimer, clearDraftTimer } = useAppDraftState();

  onMounted(() => {
    getDraft();
    getDraftTimer();
  });

  onBeforeUnmount(() => {
    clearDraftTimer();
  });
</script>

<style lang="less" scoped>
  .app-draft-state {
    --color: #ff792e;
    display: inline-flex;
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--color);
    padding: 0 8px;
    align-items: center;
    color: var(--color);
    font-size: 12px;
    background-color: rgba(from var(--color) r g b / 12%);

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--color);
      margin-right: 4px;
      box-shadow: 0px 0px 0px 1px rgba(from var(--color) r g b / 24%);
    }
  }
</style>
