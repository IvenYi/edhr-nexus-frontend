<template>
  <div :class="['item-card']">
    <div class="item-card__icon" :style="{ backgroundColor: bgColor }">
      <gct-icon :value="icon" color="#1A1D23" :size="20" />
    </div>
    <div class="item-card__data">
      <span class="item-card__sum">{{ sum }}</span>
      <span class="item-card__unit">{{ unit }}</span>
    </div>
    <div class="item-card__title">{{ title }}</div>
  </div>
</template>

<script lang="ts" setup name="item-card">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      icon: string;
      bgColor: string;
      title: string;
      sum: number;
      /** 单位 */
      unit?: string;
    }>(),
    {
      sum: 0,
    },
  );
</script>

<style lang="less" scoped>
  .item-card {
    border-radius: 8px 8px 8px 8px;
    padding: 20px;
    background: #ffffff;

    &__icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50px 50px 50px 50px;
      margin-right: 12px;
      background-color: var(--van-primary-color);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    &__data {
      padding-left: 4px;
    }

    &__sum {
      color: red;
      font-weight: bold;
      font-size: 24px;
      color: #1a1d23;
      line-height: 28px;
    }

    &__unit {
      font-weight: bold;
      font-size: 14px;
      color: #1a1d23;
    }

    &__title {
      margin-top: 4px;
      padding-left: 4px;
      font-weight: 400;
      font-size: 14px;
      color: #5a5f6b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
