<template>
  <div
    class="editor-history"
    :class="{
      'editor-history__hidden': !historyPanelVisible,
    }"
  >
    <div class="editor-history__content" v-bind="containerProps">
      <!-- <div class="editor-history__title">{{ t('sys.editor.modifyHistory') }}</div> -->
      <div class="editor-history__list" v-bind="wrapperProps">
        <template v-if="isShow">
          <div v-for="item in virtualList" class="editor-history__item" :key="item.data?.id">
            <div>{{ item.data?.createTime }}</div>
            <div class="ell" style="width: calc(100% - 50px)" :title="item.data?.createUserName">{{
              item.data?.createUserName
            }}</div>
            <a-tooltip>
              <template #title>{{ t('sys.editor.compare') }}</template>
              <i class="iconfont icon-Compare" @click="handleCompare(item.data)"></i>
            </a-tooltip>
            <a-tooltip placement="topRight">
              <template #title>{{ t('sys.editor.recover') }}</template>
              <i class="iconfont icon-recover pr-12px" @click="recover(item.data?.id)"></i>
            </a-tooltip>
          </div>
        </template>
        <template v-else>
          <div class="editor-history__empty">
            <a-empty :image="simpleImage" :description="t('sys.editor.emptyPageHistory')" />
          </div>
        </template>
      </div>
      <a-spin v-if="loading" :tip="`${t('sys.loadingText')}`">
        <div class="load-status w-full"></div>
      </a-spin>
    </div>
    <a-tooltip v-model:visible="historyPanelTooltipVisible">
      <template #title>{{
        historyPanelVisible ? t('sys.hideSider') : t('sys.expandSider')
      }}</template>
      <div
        class="editor-history__toggle"
        :class="{
          'editor-history__toggle--close': !historyPanelVisible,
        }"
        @click="handleToggle"
      >
        <i class="iconfont icon-a-Leftarrow"></i>
      </div>
    </a-tooltip>
  </div>
</template>

<script lang="ts" setup>
  import { ref, nextTick, inject, computed, unref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useScript } from '../hooks/useScript';
  import { useEditor } from '../hooks/useEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useVirtualList, useInfiniteScroll } from '@vueuse/core';

  const { t } = useI18n();

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const { historyPanelVisible, toggleHistoryPanel } = useEditor();
  const { scriptHistoryList, recover, loadScriptHistoryList, loading } = useScript();

  const historyPanelTooltipVisible = ref<boolean>(false);
  const openDiffModal = inject('openDiffModal') as Function;

  const isShow = computed(() => {
    return Array.isArray(unref(scriptHistoryList)) && unref(scriptHistoryList).length !== 0;
  });

  const handleToggle = async () => {
    historyPanelTooltipVisible.value = false;
    await nextTick();
    toggleHistoryPanel();
  };

  const handleCompare = (history) => {
    openDiffModal(true, {
      mode: 'HISTORY',
      historyId: history.id,
    });
  };

  // 使用虚拟列表
  const {
    list: virtualList,
    containerProps,
    wrapperProps,
  } = useVirtualList(scriptHistoryList, {
    itemHeight: 68,
    overscan: 10,
  });

  //  无限滚动 + 虚拟列表结合
  useInfiniteScroll(
    containerProps.ref, // 绑定同一个滚动容器
    async () => {
      loadScriptHistoryList(false); // 触底加载下一页
    },
    {
      distance: 70, // 触底阈值
    },
  );
</script>

<style lang="less" scoped>
  .editor-history {
    // --size: 280px;
    position: relative;
    width: 100%;
    padding-left: 10px;
    transition: all 0.3s;

    .editor-history__empty {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__hidden {
      width: 10px;

      .editor-history__toggle--close {
        transform: translate3d(-50%, -50%, 0);
      }
    }

    &__content {
      background: #fff;
      height: 100%;
      position: absolute;
      top: 0;
      left: 10px;
      width: 100%;
    }

    &__title {
      font-weight: bold;
      height: 48px;
      line-height: 48px;
      text-align: center;
    }

    &__list {
      border-top: 1px solid #eaeaea;
      height: 100%;
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

    &__toggle {
      height: 28px;
      width: 28px;
      border-radius: 50%;
      border: 1px solid #d9d9d9;
      position: absolute;
      top: 50%;
      left: 0;
      background: #fff;
      transform: translate3d(calc(-50% + 10px), -50%, 0) rotate(180deg);
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      .iconfont {
        line-height: 1em;
        font-size: 14px;
        color: #666;
      }
    }
  }
</style>
