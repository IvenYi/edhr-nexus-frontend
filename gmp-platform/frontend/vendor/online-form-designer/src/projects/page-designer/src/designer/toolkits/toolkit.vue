<template>
  <div
    :class="['designer-toolkit', toolkitFixed ? 'fixed-panel' : null]"
    v-dragResize="250"
    @drag-resize-width="onChangeDragResizeWidth"
    v-show="toolkitShow"
  >
    <div class="fixed-icon">
      <div class="actions">
        <div v-show="toolkit !== ToolkitEnum.FIELD" class="action-item" @click="pinnedToolkit">
          <a-tooltip
            placement="bottom"
            :title="toolkitPinned ? $t('sys.pageDesigner.unpin') : $t('sys.pageDesigner.pin')"
          >
            <i
              :class="[
                'gct-iconfont',
                toolkitPinned ? 'icon-a-icon_dingkaiqi' : 'icon-icon_ding',
                toolkitPinned ? 'active' : '',
              ]"
            ></i>
          </a-tooltip>
        </div>
        <div class="action-item" @click="fixedToolkit">
          <a-tooltip
            placement="bottom"
            :title="toolkitFixed ? $t('sys.pageDesigner.unfixed') : $t('sys.pageDesigner.expand')"
          >
            <i
              :class="[
                'gct-iconfont',
                toolkitFixed ? 'icon-icon_daohangqushouqi' : 'icon-icon_daohangquzhankai',
              ]"
            ></i>
          </a-tooltip>
        </div>
      </div>
    </div>
    <!-- <a-button type="text" class="fixed-icon" @click="fixedToolkit">
      <template #icon>
        <pushpin-outlined v-if="!toolkitFixed" />
        <pushpin-filled v-else />
      </template>
    </a-button> -->
    <!-- <pushpin-filled></pushpin-filled> -->
    <div class="designer-toolkit__header">{{ toolkitTitle }}</div>
    <div class="designer-toolkit__main">
      <component
        v-for="(comp, name) in toolkitComps"
        v-show="toolkitName === name"
        :key="name"
        :is="comp"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import { ToolkitOptions } from '/@page-designer/constant/toolkit';
  import { ToolkitEnum } from '/@page-designer/enum/toolkit';

  const emit = defineEmits(['dragResizeWidth']);

  const { toolkit, toolkitShow, fixedToolkit, toolkitFixed, toolkitPinned, pinnedToolkit } =
    useToolkit();

  const toolkitName = computed(() => {
    return 'toolkit-' + toolkit.value.toLowerCase();
  });

  const toolkitTitle = computed(() => {
    const data = ToolkitOptions.find((item) => item.code === toolkit.value);
    return data?.navName || data?.name || toolkitName;
  });

  const toolkitComps = {};
  const modules: Record<string, any> = import.meta.glob('./toolkit-*.vue', {
    eager: true,
  });

  function onChangeDragResizeWidth(event: CustomEvent) {
    emit('dragResizeWidth', event.detail.width);
  }

  for (const path in modules) {
    const name = modules[path].default.name;
    toolkitComps[name] = modules[path].default;
  }
</script>

<style lang="less" scoped>
  .designer-toolkit {
    position: relative;
    font-size: 12px;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 42px;
      padding: 0 12px;
      border-bottom: 1px solid @gct-modal-border-color;
      color: @gct-text-main-color;
      font-weight: 500;

      & + div {
        height: calc(100% - 42px);
        overflow-y: auto;
      }
    }

    .fixed-icon {
      position: absolute;
      right: 12px;
      font-size: 16px;
      line-height: 1;
    }

    :deep(.ant-collapse) {
      font-size: 12px;
    }
  }

  .designer-toolkit__header {
    background-color: #fff;
  }

  .designer-toolkit__main {
    width: 100%;
  }

  .fixed-panel {
    position: absolute !important;
    z-index: 1000;
    left: 48px;
    width: 650px !important;
    height: inherit;
    background-color: #f2f4f7;
  }

  .actions {
    height: 42px;
    display: flex;
    align-items: center;
  }

  .action-item {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    color: #8b8b8b;

    &:hover {
      background-color: var(--gct-color-bg-3);
    }

    &:active {
      background-color: var(--gct-color-bg-4);
    }

    .gct-iconfont.active {
      color: var(--gct-color-primary);
    }
  }
</style>
