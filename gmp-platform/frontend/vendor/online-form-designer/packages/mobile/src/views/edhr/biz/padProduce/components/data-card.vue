<template>
  <div :class="['data-card']">
    <div class="h-50px flex items-center">
      <gct-icon value="icon-preset:edhr-shengchanshuju" :size="20" />
      <span class="ml-8px text-17px color-#1A1D23 font-bold"> 生产数据 </span>
    </div>
    <div class="flex justify-between gap-16px mb-8px">
      <div class="data-card__item">
        <div class="data-card__item-title"> 总数 </div>
        <div class="data-card__item-value">
          {{ data.totalNum }}
        </div>
      </div>
      <div class="data-card__item">
        <div class="data-card__item-title"> 总时长(时) </div>
        <div class="data-card__item-value">
          {{ data.totalDuration }}
        </div>
      </div>
    </div>
    <div class="flex justify-between gap-16px">
      <div class="data-card__item">
        <div class="data-card__item-title"> 良品数 </div>
        <div class="data-card__item-value">
          {{ data.goodNum }}
        </div>
      </div>
      <div class="data-card__item">
        <div class="data-card__item-title"> 不良品数 </div>
        <div class="data-card__item-value" :style="{ color: '#FF9442' }">
          {{ data.notGoodNum }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="data-card">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      data?: {
        totalNum?: number;
        goodNum?: number;
        notGoodNum?: number;
        totalDuration?: string;
      };
    }>(),
    {
      data: () => ({}),
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();
</script>

<style lang="less" scoped>
  .data-card {
    padding: 0 16px;

    // &::after {
    //   content: '';
    //   display: block;
    //   width: 100%;
    //   margin-top: 20px;
    //   border-bottom: 1px solid #e0e3eb;
    // }

    &__item {
      flex: 1;
      padding: 14px;
      border-radius: 8px;
      background: #f7f8fa;
    }

    &__item-title {
      margin-bottom: 4px;
      color: #8b8b8b;
      font-size: 14px;
      line-height: 22px;
    }

    &__item-value {
      color: #5a5f6b;
      font-size: 18px;
      font-weight: bold;
      line-height: 24px;
    }
  }
</style>
