<template>
  <van-empty :image="NoData" :image-size="size" :class="['empty']" :description="description" />
</template>

<script lang="ts" setup name="empty">
  import { i18n } from '@mobile/locales/setupI18n';
  import NoData from '@mobile/assets/svg/edhr/nodata.svg';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      size?: number | Array;
      description?: string;
    }>(),
    {
      size: 124,
    },
  );
</script>

<style lang="less" scoped>
  .empty {
    --empty-font-size: 14px;
    --empty-description-margin: 12px 0 0 0;

    :deep(.van-empty__description) {
      margin: var(--empty-description-margin);
      color: #8b8b8b;
      font-size: var(--empty-font-size);
      font-weight: 400;
    }
  }
</style>
