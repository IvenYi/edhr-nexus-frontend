<template>
  <div class="designer-stage-header">
    <user-occupy class="" />

    <!-- <div class="designer-actions">
      <a-tooltip>
        <template #title>{{ t('sys.editor.prev') }}</template>
        <i
          class="iconfont icon-shangyibu"
          :class="{
            'cache--disabled': undoDisabled,
          }"
          @click="onUndo"
        ></i>
      </a-tooltip>

      <div class="designer-actions__divider"></div>
      <a-tooltip>
        <template #title>{{ t('sys.editor.next') }}</template>
        <i
          class="iconfont icon-xiayibu"
          :class="{
            'cache--disabled': restoreDisabled,
          }"
          @click="onRestore"
        ></i>
      </a-tooltip>
    </div> -->
    <div class="designer-panel-nav">
      <div
        :class="{
          'designer-panel-nav-item--active': PanelEnum.PAGE === currentPanel,
        }"
        @click="togglePanel(PanelEnum.PAGE)"
      >
        <i class="iconfont icon-yemianshuxing"></i>
        {{ t('sys.pageDesigner.pageProp') }}
      </div>

      <div
        :class="{
          'designer-panel-nav-item--active': PanelEnum.HISTORY === currentPanel,
        }"
        @click="togglePanel(PanelEnum.HISTORY)"
        ><i class="iconfont icon-lishijilu"></i>{{ t('sys.pageDesigner.historyLog') }}</div
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PanelEnum, useDesigner } from '../hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const { currentPanel, togglePanel } = useDesigner();

  // const historyIdRef = ref<string>(queryStore.getPid() ?? '');

  // const { undoDisabled, restoreDisabled, onUndo, onRestore } = useCacheHistoryInner({
  //   historyIdRef: historyIdRef,
  //   callback: undoOrRestore,
  // });
</script>

<style lang="less" scoped>
  .designer-stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 16px;
  }

  .designer-user {
    color: #7f8695;
    display: flex;
    align-items: center;
    line-height: 1em;
    .designer-user__username {
      color: var(--ant-primary-color);
    }
    .iconfont {
      margin-right: 6px;
    }
  }

  .designer-actions {
    margin-left: auto;
    display: flex;
    color: #7f8695;
    // line-height: 1em;
    align-items: center;
    margin-right: 15px;

    .iconfont {
      cursor: pointer;
      &:hover {
        color: var(--ant-primary-color);
      }
      &.cache {
        &--disabled {
          color: #7f8695;
          opacity: 0.25;
          cursor: not-allowed;
        }
      }
    }

    &__divider {
      height: 16px;
      margin: 0 12px;
      border-left: 1px solid #eaeaea;
    }
  }

  .designer-lang {
    margin: 0 12px 0 20px;
    width: 100px;
  }

  .designer-panel-nav {
    height: 100%;
    border-left: 1px solid #efefef;
    padding: 0 16px;
    display: flex;
    align-items: center;
    color: #333;
    min-width: 280px;
    justify-content: center;

    > div {
      cursor: pointer;
      display: flex;
      align-items: center;
      line-height: 1em;
      font-size: 12px;

      .iconfont {
        margin-right: 5px;
      }

      &:hover {
        color: var(--ant-primary-color);
      }
    }

    > div:not(:last-child) {
      margin-right: 20px;
    }

    &-item--active {
      color: var(--ant-primary-color);
    }
  }
</style>
