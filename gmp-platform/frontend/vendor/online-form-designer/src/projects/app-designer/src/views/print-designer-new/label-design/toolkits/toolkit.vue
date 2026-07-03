<template>
  <div :class="['designer-toolkit', toolkitFixed ? 'fixed-panel' : null]" v-dragResize="264">
    <a-button type="link" class="fixed-icon" @click="fixedToolkit">
      <template #icon>
        <pushpin-outlined v-if="!toolkitFixed" />
        <pushpin-filled v-else />
      </template>
    </a-button>
    <!-- <pushpin-filled></pushpin-filled> -->
    <div class="designer-toolkit__header">{{ t('sys.pageDesigner.widget') }}</div>
    <div>
      <toolkit-widgets />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import ToolkitWidgets from './toolkit-widgets.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { fixedToolkit, toolkitFixed } = useToolkit();
</script>

<style lang="less" scoped>
  .designer-toolkit {
    position: relative;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 42px;
      padding: 0 16px;
      border-bottom: 1px solid #eaeaea;
      font-weight: bold;
      background: #fff;

      & + div {
        height: calc(100% - 42px);
        overflow-y: auto;
      }
    }
    .fixed-icon {
      position: absolute;
      top: 7px;
      right: 11px;
    }
  }
  .fixed-panel {
    position: absolute !important;
    left: 0px;
    z-index: 9999;
    height: inherit;
    width: 650px !important;
  }
</style>
