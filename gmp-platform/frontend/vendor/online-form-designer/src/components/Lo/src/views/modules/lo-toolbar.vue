<template>
  <div class="so-toolbar">
    <user-occupy class="mr-40px" />

    <a-tooltip>
      <template #title>{{ t('sys.editor.saveAsNewVersion') }}</template>
      <div class="flex items-center cursor-pointer" @click="handleClickSaveAs">
        <i class="iconfont icon-a-Saveas mr-6px"></i>
        另存为
      </div>
    </a-tooltip>

    <div style="--space-r: 16px" class="gct-divider__vertical"></div>

    <a-tooltip>
      <template #title>{{ t('sys.editor.history') }}</template>
      <i
        class="iconfont icon-history mr-20px"
        :class="{
          'icon--active': soHistoryListVisible,
        }"
        @click="toggleHistoryPanel"
      ></i>
    </a-tooltip>

    <a-tooltip>
      <template #title>{{ t('sys.editor.execute') }}</template>
      <i class="iconfont icon-a-Carryout" @click="execute"></i>
    </a-tooltip>

    <a-select
      class="w-80px"
      size="small"
      :value="soVersion.id"
      @select="(value) => changeVersion(value)"
    >
      <a-select-option v-for="item in soVersionList" :key="item.id">{{
        item.version
      }}</a-select-option>
    </a-select>

    <div class="panel-nav ml-12px">
      <div
        v-for="p in PanelOptions"
        :key="p.value"
        class="flex items-center cursor-pointer panel-nav-item"
        :class="{
          'panel-nav-item--active': p.value === panel,
        }"
        @click="setPanel(p.value)"
      >
        <i class="iconfont" :class="p.icon"></i>
        {{ p.label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useScript } from '/@app-designer/views/script-editor/hooks/useScript';
  // import { useEditor } from '/@app-designer/views/script-editor/hooks/useEditor';
  import { PanelOptions } from '../constants';
  import { useSOInstance } from '../hooks/useSOInstance';

  import { UserOccupy, UserLock } from '/@/components/UserOccupy';

  const { t } = useI18n();
  const {
    panel,
    setPanel,
    soVersion,
    soVersionList,
    changeVersion,
    setSoHistoryListVisible,
    soHistoryListVisible,
    execute,
  } = useSOInstance();
  const openSaveAsModal = inject('openSaveAsModal') as Function;

  const toggleHistoryPanel = () => {
    setSoHistoryListVisible(!soHistoryListVisible.value);
  };

  const handleClickSaveAs = () => {
    openSaveAsModal(true);
  };
</script>

<style lang="less" scoped>
  .so-toolbar {
    display: flex;
    align-items: center;
    line-height: 1em;
    padding-left: 16px;

    .iconfont {
      cursor: pointer;
    }

    .icon--active {
      color: var(--ant-primary-color);
    }

    .ant-select {
      margin-left: auto;
    }

    .cache {
      &--disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }
    }
  }

  .panel-nav {
    height: 100%;
    border-left: 1px solid #efefef;
    padding: 0 16px;
    display: flex;
    align-items: center;
    color: #333;

    .iconfont {
      margin-right: 3px;
      color: #7f8695;
    }

    &-item:not(:last-child) {
      margin-right: 12px;
    }

    &-item--active {
      color: var(--ant-primary-color);
      .iconfont {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
