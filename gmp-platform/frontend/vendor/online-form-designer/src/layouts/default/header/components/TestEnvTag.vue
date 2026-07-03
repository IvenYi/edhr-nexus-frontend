<template>
  <div class="test-env-tag">
    {{ t('sys.integration.env.test') }}
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .test-env-tag {
    --color: #ff792e;

    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 8px;
    border: 1px solid var(--color);
    border-radius: 4px;
    background-color: rgba(from var(--color) r g b / 12%);
    color: var(--color);
    font-size: 12px;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      margin-right: 4px;
      border-radius: 50%;
      background-color: var(--color);
      box-shadow: 0 0 0 1px rgba(from var(--color) r g b / 24%);
    }
  }
</style>
