<template>
  <div :class="['list-item']">
    <div class="flex justify-between">
      <span class="list-item__title">{{ title }}</span>
      <span v-if="status" class="list-item__status">{{ status }}</span>
    </div>
    <div class="list-item__subtitle">{{ subTitle }}</div>
  </div>
</template>

<script lang="ts" setup name="list-item">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      title: string;
      subTitle: string;
      status?: string;
      statusColor?: string;
      statusBgColor?: string;
      statusBorderColor?: string;
    }>(),
    {
      statusColor: '#8B8B8B',
      statusBgColor: '#8B8B8B14',
      statusBorderColor: '#8B8B8B80',
    },
  );
</script>

<style lang="less" scoped>
  .list-item {
    padding: 12px 16px;
    margin-bottom: 8px;
    background: #ffffff;
    border-radius: 12px 12px 12px 12px;

    &__title {
      font-weight: 400;
      font-size: 15px;
      color: #1a1d23;
      line-height: 28px;
      word-break: break-all;
    }

    &__subtitle {
      margin-top: 2px;
      font-weight: 400;
      font-size: 13px;
      color: #8b8b8b;
      line-height: 20px;
    }

    &__status {
      font-size: 12px;
      color: #1a1d23;
      padding: 0 10px;
      line-height: 26px;
      border-radius: 13px 13px 13px 13px;
      border: 1px solid v-bind('props.statusBorderColor');
      background: v-bind('props.statusBgColor');
      white-space: nowrap;
      height: fit-content;

      &::before {
        content: '';
        background: v-bind('props.statusColor');
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        margin-right: 8px;
      }
    }
  }
</style>
