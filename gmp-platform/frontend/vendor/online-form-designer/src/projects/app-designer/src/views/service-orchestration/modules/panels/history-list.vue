<template>
  <div
    class="so-history"
    :class="{
      'so-history--visible': soHistoryListVisible,
    }"
  >
    <div class="history__title">{{ t('sys.editor.modifyHistory') }}</div>
    <div class="history__content" v-bind="containerProps">
      <div class="history__list" v-bind="wrapperProps">
        <div v-for="item in virtualList" class="history__item" :key="item.data?.id">
          <div>{{ item.data?.createTime }}</div>
          <div class="ell" style="width: calc(100% - 50px)" :title="item.data?.createUserName">{{
            item.data?.createUserName
          }}</div>
        </div>
      </div>
      <a-spin v-if="loading" :tip="`${t('sys.loadingText')}`">
        <div class="load-status w-full"></div>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useSOInstance } from '../../hooks/useSOInstance';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useVirtualList, useInfiniteScroll } from '@vueuse/core';

  const { t } = useI18n();

  const { soHistoryList, soHistoryListVisible, loading, loadSoHistoryList } = useSOInstance();

  // 使用虚拟列表;
  const {
    list: virtualList,
    containerProps,
    wrapperProps,
  } = useVirtualList(soHistoryList, {
    itemHeight: 68,
    overscan: 10,
  });

  // 无限滚动 + 虚拟列表结合;
  useInfiniteScroll(
    containerProps.ref, // 绑定同一个滚动容器
    async () => {
      loadSoHistoryList(false); // 触底加载下一页
    },
    {
      distance: 70, // 触底阈值
    },
  );
</script>

<style lang="less" scoped>
  // @prefix-cls: 'his';
  .so-history {
    height: 100%;
    width: 100%;
    background: #fff;
    overflow-y: auto;
    position: absolute;
    top: 0;
    left: 0;
    transform: translateX(100%);
    transition: all 0.3s;

    &--visible {
      transform: translateX(0);
    }
  }
  .history {
    &__title {
      font-weight: bold;
      color: #333;
      height: 48px;
      line-height: 48px;
      text-align: center;
      border-bottom: 1px solid #d9d9d9;
    }

    &__content {
      // border-top: 1px solid #eaeaea;
      height: calc(100% - 48px);
      overflow: auto;
    }

    &__item {
      line-height: 1.2;
      padding: 13px 16px 10px;
      position: relative;
      border-bottom: 1px solid #eaeaea;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        background-color: #edf6f6;
      }

      > div:nth-child(2) {
        color: #9d9da6;
        margin-top: 10px;
      }

      .iconfont {
        position: absolute;
        bottom: 10px;
        right: 48px;
        color: #9b9b9b;

        &:nth-child(4) {
          right: 4px;
        }

        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
