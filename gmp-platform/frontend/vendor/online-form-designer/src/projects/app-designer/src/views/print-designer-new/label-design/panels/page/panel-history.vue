<template>
  <div class="page-history-container">
    <div class="page-history-title">{{ t('sys.pageDesigner.historyTitle') }}</div>
    <div class="page-history-wrapper" v-bind="containerProps">
      <div class="page-history-list" v-bind="wrapperProps">
        <template v-if="isShow">
          <div class="page-history-item" v-for="item in virtualList" :key="item.data?.id">
            <div class="page-history-item__time">{{ item.data?.createTime }}</div>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div class="page-history-item__name">{{ item.data?.createUserName }}</div>
              <div class="page-history-item__action">
                <a-tooltip arrowPointAtCenter>
                  <template #title>{{ t('sys.pageDesigner.compare') }}</template>
                  <i class="iconfont icon-Compare mr-12px" @click="handleCompare(item.data)"></i>
                </a-tooltip>
                <a-popconfirm
                  :title="t('sys.sureToRecover')"
                  placement="topRight"
                  @confirm="() => recover(item.data?.id ?? '')"
                >
                  <a-tooltip arrowPointAtCenter>
                    <template #title>{{ t('sys.pageDesigner.recover') }}</template>
                    <i class="iconfont icon-recover"></i>
                  </a-tooltip>
                </a-popconfirm>
              </div>
            </div>
          </div>
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
  import { unref, computed, inject } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePage } from '../../hooks/usePage';
  import { useVirtualList, useInfiniteScroll } from '@vueuse/core';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const openDiffModal = inject('openDiffModal') as Function;

  const { t } = useI18n();

  const { pageDesignHistoryList, recover, loadLabelDesignHistoryList, loading } = usePage();

  const isShow = computed(() => {
    return Array.isArray(unref(pageDesignHistoryList)) && unref(pageDesignHistoryList).length !== 0;
  });

  /** 比对 */
  const handleCompare = (history) => {
    openDiffModal(true, {
      hid: history.id,
    });
  };

  // 使用虚拟列表
  const {
    list: virtualList,
    containerProps,
    wrapperProps,
  } = useVirtualList(pageDesignHistoryList, {
    itemHeight: 68,
    overscan: 10,
  });

  // 无限滚动 + 虚拟列表结合
  useInfiniteScroll(
    containerProps.ref, // 绑定同一个滚动容器
    async () => {
      loadLabelDesignHistoryList(); // 触底加载下一页
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
      font-weight: bold;
      height: 42px;
      line-height: 42px;
      text-align: center;
      border-bottom: 1px solid #eaeaea;
    }
    .page-history {
      &-wrapper {
        height: 100%;
        overflow: auto;
      }
      // &-list {
      //   height: 100%;
      //   overflow: auto;
      // }

      &-item {
        line-height: 1.2;
        padding: 14px 18px 10px;
        position: relative;
        border-bottom: 1px solid #eaeaea;
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

        .iconfont {
          color: #9b9b9b;

          &:hover {
            color: var(--ant-primary-color);
          }
        }
      }
    }
  }
</style>
