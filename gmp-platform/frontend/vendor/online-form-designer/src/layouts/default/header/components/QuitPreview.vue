<template>
  <div class="quit-preview" @click="quitPreview">
    {{ t('sys.quitPreview') }}
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePreview } from '/@/hooks/develop/usePreview';

  const { t } = useI18n();
  const { quitPreview } = usePreview();
</script>

<style lang="less" scoped>
  .quit-preview {
    --color: #fff;

    display: inline-flex;
    align-items: center;
    height: 30px;
    padding: 0 16px;
    border: 1px solid var(--color);
    border-radius: 4px;
    color: var(--color);
    font-size: 14px;
    cursor: pointer;
  }

  .horizontal-mix-sider-layout {
    .quit-preview {
      --color: var(--ant-primary-color);
    }
  }
</style>
