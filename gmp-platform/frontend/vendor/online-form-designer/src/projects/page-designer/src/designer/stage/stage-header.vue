<template>
  <div class="designer-stage-header">
    <user-occupy class="" />
    <div class="designer-actions">
      <design-icon-button
        :active="false"
        @click="onUndo"
        :tip="t('sys.editor.undo')"
        :disabled="undoDisabled"
      >
        <template #icon>
          <i class="iconfont icon-shangyibu"></i>
        </template>
      </design-icon-button>
      <design-icon-button
        :active="false"
        @click="onRestore"
        :tip="t('sys.editor.redo')"
        :disabled="restoreDisabled"
      >
        <template #icon>
          <i class="iconfont icon-xiayibu"></i>
        </template>
      </design-icon-button>
      <design-icon-button
        :active="false"
        @click="togglePanel(PanelEnum.HISTORY)"
        :tip="t('sys.pageDesigner.historyLog')"
      >
        <template #icon>
          <i class="gct-iconfont icon-icon_lishi"></i>
        </template>
      </design-icon-button>
      <div class="designer-actions__divider"></div>
      <design-icon-button
        :active="false"
        @click="togglePanel(PanelEnum.GLOBAL)"
        :tip="t('sys.pageDesigner.globalSetting')"
      >
        <template #icon>
          <i class="gct-iconfont icon-icon_quanjushezhi"></i>
        </template>
      </design-icon-button>
      <div class="designer-actions__divider"></div>
      <a-button class="page-prop" type="link" @click="onSelectPage">
        {{ t('sys.pageDesigner.pageProp') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { PanelEnum, SCOPE } from '/@page-designer/enum';
  import { togglePanel } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useQueryStore } from '/@/store/modules/query';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCacheHistoryInner } from '/@/hooks/develop/useCacheHistory';
  import { UserOccupy } from '/@/components/UserOccupy';
  import { useSelectedWidget } from '../../hooks/useSelectedWidget';

  const { t } = useI18n();

  const queryStore = useQueryStore();

  const { resetSelectedWidget, resetSelectedModal } = useSelectedWidget();

  // const { pageOccupyInfo } = usePageOccupy();
  const { undoOrRestore, setSubTableModalDesignState, setModalDesignState } = useDesigner();

  const historyIdRef = ref<string>(queryStore.getPid() ?? '');

  const { undoDisabled, restoreDisabled, onUndo, onRestore } = useCacheHistoryInner({
    historyIdRef: historyIdRef,
    callback: undoOrRestore,
  });

  function onSelectPage() {
    setSubTableModalDesignState(false);
    setModalDesignState(false);
    resetSelectedWidget(SCOPE.PAGE);
    resetSelectedModal();
    togglePanel(PanelEnum.PAGE);
  }
</script>

<style lang="less" scoped>
  .designer-stage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .user-occupy {
      color: #5c616a;
    }
  }

  .gct-design-icon-button {
    margin-right: 8px;
  }

  .mode-icon {
    width: 30px;
    height: 30px;
    background-color: rgba(2, 106, 200, 0.08);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;

    > .gct-iconfont {
      font-size: 18px;
      line-height: 18px;
      color: var(--ant-primary-color);
    }
  }

  .designer-user {
    display: flex;
    align-items: center;
    color: #797a7d;
    line-height: 1em;

    .designer-user__username {
      color: var(--ant-primary-color);
    }

    .gct-iconfont,
    .iconfont {
      margin-right: 6px;
    }
  }

  .designer-actions {
    // margin-right: 20px;
    display: flex;
    // line-height: 1em;
    align-items: center;
    height: 100%;
    margin-left: auto;
    color: #797a7d;

    .gct-iconfont,
    .iconfont {
      // padding: 1px 6px;
      border-radius: 4px;
      cursor: pointer;

      & + .gct-iconfont,
      & + .iconfont {
        margin-left: 20px;
      }

      &.active {
        background-color: #f5f5f5;
        // padding: 4px 6px;
      }

      &:hover {
        color: var(--ant-primary-color);
      }

      &.cache {
        &--disabled {
          opacity: 0.25;
          color: #797a7d;
          cursor: default;
        }
      }

      &.icon-a-Cellphone,
      &.icon-pad {
        margin-left: 14px;
        padding: 1px 6px;
      }
    }

    &__divider {
      height: 16px;
      margin-right: 8px;
      border-left: 1px solid #eaeaea;
    }
  }

  .designer-lang {
    width: 100px;
    margin: 0 12px 0 20px;
  }

  .designer-panel-nav {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 16px;
    border-left: 1px solid #efefef;
    color: #333;

    > div {
      display: flex;
      align-items: center;
      font-size: 12px;
      line-height: 1em;
      cursor: pointer;

      .gct-iconfont,
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

  .page-prop.ant-btn.ant-btn-link {
    padding: 4px 0;
    color: currentColor;
    padding-left: 12px;

    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
