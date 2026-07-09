<template>
  <div class="page-history-container">
    <div class="page-history-title">
      {{ t('sys.pageDesigner.historyTitle') }}
      （{{ pageDesignHistoryList.length || 0 }}<span style="color: #8f8f8f">/1000</span>）
    </div>
    <div class="page-history-wrapper" v-bind="containerProps">
      <div class="page-history-list" ref="listContent" v-bind="wrapperProps">
        <template v-if="isShow">
          <template v-for="(item, index) in virtualList" :key="index">
            <div class="page-history-item" v-if="index === 0">
              <div class="page-history-item__time">{{ currentDate }}</div>
              <div class="page-history-item__name">
                <a-tag color="processing">{{ t('sys.app.currentVersion') }}</a-tag>
              </div>
            </div>
            <panel-history-item
              v-else
              :itemData="item.data"
              @recover="recover"
              @itemCompare="handleCompare"
              @openModal="openPreviewModal"
              @deleteHistory="deleteHistory"
            />
          </template>
        </template>
        <template v-else>
          <div style="display: flex; justify-content: center; align-items: center; height: 100%">
            <a-empty :image="simpleImage" :description="t('sys.pageDesigner.emptyPageHistory')" />
          </div>
        </template>
      </div>
      <a-spin v-if="loading" :tip="`${t('sys.loadingText')}`">
        <div class="load-status w-full"></div>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup name="panel-history">
  import { unref, computed, inject, ref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dayjs from 'dayjs';
  import panelHistoryItem from './panel-history-item.vue';
  import { uuid2 } from '/@/utils/uuid';
  import { useVirtualList, useInfiniteScroll } from '@vueuse/core';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const openDiffModal = inject('openDiffModal') as Function;

  const openPreview = inject('openPreview') as Function;
  const openPreviewModal = (hid: string) => {
    const options = historyPreview(hid);
    openPreview(options);
  };

  const { t } = useI18n();

  const {
    pageDesignHistoryList,
    recover,
    historyPreview,
    deleteHistory,
    loadPageDesignHistoryList,
    loading,
  } = useDesigner();

  const currentDate = dayjs().format('YYYY-MM-DD');

  const isShow = computed(() => {
    return Array.isArray(unref(pageDesignHistoryList)) && unref(pageDesignHistoryList).length !== 0;
  });

  /** 比对 */
  const handleCompare = (history) => {
    openDiffModal(true, {
      hid: history.id,
    });
  };

  const allHistoryList = computed(() => {
    const firstData = {
      currentDate,
      id: uuid2(16),
      name: '',
    };
    return isShow.value ? [firstData, ...pageDesignHistoryList.value] : [firstData];
  });

  // 使用虚拟列表
  const {
    list: virtualList,
    containerProps,
    wrapperProps,
  } = useVirtualList(allHistoryList, {
    itemHeight: 69,
    overscan: 10,
  });

  // 无限滚动 + 虚拟列表结合
  useInfiniteScroll(
    containerProps.ref, // 绑定同一个滚动容器
    async () => {
      loadPageDesignHistoryList(); // 触底加载下一页
    },
    {
      distance: 20, // 触底阈值
    },
  );
</script>
<style lang="less" scoped>
  .page-history-container {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    .page-history-title {
      height: 42px;
      line-height: 42px;
      border-bottom: 1px solid @gct-modal-border-color;
      padding-left: 12px;
      color: #212528;
    }
    .page-history-item__name {
      font-size: 12px;
      color: #8f8f8f;
    }
    .page-history {
      &-wrapper {
        height: 100%;
        overflow: auto;
      }

      &-item {
        line-height: 1.2;
        padding: 14px 18px 10px;
        position: relative;
        border-bottom: 1px solid @gct-modal-border-color;
        transition: all 0.3s;
        cursor: pointer;
        &:hover {
          background-color: #edf6f6;
        }

        &__time {
          color: #333;
          line-height: 22px;
        }

        &__name {
          color: #9d9da6;
          line-height: 22px;
        }
      }
    }
  }
</style>
