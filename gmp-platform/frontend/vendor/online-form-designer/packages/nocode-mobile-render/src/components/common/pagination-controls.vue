<template>
  <div class="pagination-controls">
    <van-button
      class="flex-1 pagination-btn"
      type="default"
      :loading="paginationStatus?.loadingPrev.value"
      :disabled="paginationStatus?.loadingPrev.value || paginationStatus?.isStart.value"
      loading-text="加载中..."
      @click="emit('on-prev')"
    >
      <van-icon name="arrow-left" /> {{ prevTitle }}
    </van-button>
    <div class="w-80px ks-row-center pagination">
      <span class="primary-gct">{{ current + 1 }}</span>
      /
      <span>{{ paginationStatus?.total }}</span>
    </div>
    <van-button
      class="flex-1 pagination-btn"
      type="primary"
      :loading="paginationStatus?.loadingNext.value"
      :disabled="paginationStatus?.loadingNext.value || paginationStatus?.isEnd.value"
      loading-text="加载中..."
      @click="emit('on-next')"
      >{{ nextTitle }} <van-icon name="arrow" />
    </van-button>
  </div>
</template>

<script setup lang="ts" name="pagination-controls">
  import type { PaginationStatus } from '../../types';

  withDefaults(
    defineProps<{
      current: number;
      paginationStatus: PaginationStatus;
      prevTitle: string;
      nextTitle: string;
    }>(),
    {
      prevTitle: '上一行',
      nextTitle: '下一行',
    },
  );

  const emit = defineEmits(['on-next', 'on-prev']);
</script>

<style scoped lang="less">
  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 16px;

    .pagination {
      border: var(--van-button-border-width) solid rgba(220, 222, 224, 0.5);
      height: var(--van-button-default-height);
      display: inline-flex;
      align-items: center;
      border-radius: var(--van-button-radius);
    }

    :deep(.van-button.pagination-btn.van-button--loading .van-button__text) {
      font-size: 12px;
    }
  }
</style>
