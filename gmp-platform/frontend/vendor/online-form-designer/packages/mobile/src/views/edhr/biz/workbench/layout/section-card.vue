<template>
  <div :class="['section-card']">
    <div class="section-card__header">
      <div class="section-card__title">
        <span>{{ title }}</span>
        <slot name="after-title"></slot>
      </div>
      <div class="section-card__right">
        <slot name="right"></slot>
      </div>
    </div>
    <van-pull-refresh
      class="section-card__pull-refresh"
      v-model="pullLoading"
      @refresh="onRefresh"
      :disabled="disabledPullRefresh"
    >
      <div class="section-card__content">
        <van-loading v-if="loading" class="section-card__loading" size="24px"
          >加载中...</van-loading
        >
        <Empty
          v-else-if="empty"
          class="w-full h-full rounded-12px"
          description="暂无数据"
          :size="[90, 66]"
        />
        <slot v-else></slot>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script lang="ts" setup name="section-card">
  import { i18n } from '@mobile/locales/setupI18n';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      title?: string;
      empty?: boolean;
      loading?: boolean;
      /** 禁用下拉刷新功能 */
      disabledPullRefresh?: boolean;
    }>(),
    {
      empty: true,
      loading: false,
      disabledPullRefresh: false,
    },
  );

  const emit = defineEmits<{
    (e: 'refresh'): void;
  }>();

  const pullLoading = ref(false);

  const onRefresh = () => {
    emit('refresh');
    pullLoading.value = false;
  };
</script>

<style lang="less" scoped>
  .section-card {
    // background: #ffffff;
    // border-radius: 8px 8px 8px 8px;
    // padding: 16px;
    overflow: hidden;
    .empty {
      --empty-font-size: 14px;
      --empty-description-margin: 12px 0 0 0;
    }

    :deep(.van-empty) {
      --van-empty-padding: 0;
    }

    &__loading {
      position: absolute;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    &__title {
      font-weight: bold;
      font-size: 17px;
      color: #1a1d23;
      line-height: 24px;
    }

    &__pull-refresh {
      height: calc(100% - 36px);
    }
    &__content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }
  }
</style>
