<template>
  <div class="edhr-form-status" :class="code"
    >{{ code ? t(`sys.edhr.formInsStatusEnum.${code}`) : '' }}
  </div>
</template>

<script setup lang="ts">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = defineProps<{
    code: string;
  }>();
</script>

<style scoped lang="less">
  .edhr-form-status {
    height: 22px;
    border-radius: 4px;
    font-weight: 400;
    font-size: 14px;
    display: inline-flex;
    padding: 0 4px;
    align-items: center;
    --status-color: #969ca9;
    color: var(--edhr-form-status-color);

    &::before {
      content: '';
      height: 6px;
      width: 6px;
      border-radius: 6px;
      background-color: var(--edhr-form-status-color);
      display: inline-block;
      margin-right: 6px;
    }

    &.UNFILLED,
    &.UNRELEASED {
      --edhr-form-status-color: #969ca9;
    }

    &.RUNNING,
    &.running,
    &.RELEASE {
      --edhr-form-status-color: #247bff;
    }

    &.COMPLETED,
    &.finished {
      --edhr-form-status-color: #45d192;
    }

    &.ARCHIVED {
      --edhr-form-status-color: #dda200;
    }

    &.STASH {
      --edhr-form-status-color: #ff9442;
    }

    &.EXCEPTION {
      --edhr-form-status-color: var(--ant-warning-color);
    }
  }
</style>
