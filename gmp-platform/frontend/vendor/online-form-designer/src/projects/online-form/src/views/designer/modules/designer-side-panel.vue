<template>
  <aside class="designer-side-panel">
    <div class="designer-side-panel__header">
      <span>{{ panelTitle }}</span>
      <button class="designer-side-panel__close" type="button" aria-label="关闭左侧面板" @click="emit('close')">
        ×
      </button>
    </div>
    <div
      class="designer-side-panel__body"
      :class="{
        'designer-side-panel__body--pages': activePanel === 'pages',
        'designer-side-panel__body--fields': activePanel === 'fields',
        'designer-side-panel__body--widgets': activePanel === 'widgets',
      }"
    >
      <PageThumbnails v-if="activePanel === 'pages'" />
      <ToolkitContentFields v-else-if="activePanel === 'fields'" />
      <ToolkitContentWidgets v-else />
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import PageThumbnails from './page-thumbnails.vue';
  import ToolkitContentFields from './toolkit/toolkit-content-fields';
  import ToolkitContentWidgets from './toolkit/toolkit-content-widgets/toolkit-content-widgets.vue';

  type HostedSidePanelKey = 'pages' | 'fields' | 'widgets';

  const props = defineProps<{
    activePanel: HostedSidePanelKey;
  }>();
  const emit = defineEmits<{ (e: 'close'): void }>();

  const panelTitle = computed(() => {
    if (props.activePanel === 'fields') return '字段管理';
    if (props.activePanel === 'widgets') return '组件管理';
    return '分页缩略图';
  });
</script>

<style lang="less" scoped>
  .designer-side-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border-right: 1px solid #e0e3ea;
    background: #fff;

    &__header {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: space-between;
      height: 48px;
      padding: 0 14px 0 16px;
      border-bottom: 1px solid #e8ebf0;
      color: #333;
      font-size: 15px;
      font-weight: 500;
      line-height: 22px;
    }

    &__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: #797a7d;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;

      &:hover {
        background: #f2f4f7;
        color: #333;
      }
    }

    &__body {
      flex: 1 1 auto;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    &__body--fields,
    &__body--widgets {
      overflow-y: auto;
    }

    &__body--fields {
      :deep(.toolkit-fields-cascader) {
        max-height: none;
        height: 100%;
      }

      :deep(.toolkit-fields-cascader-area) {
        flex: 1 1 auto;
        min-height: 0;
      }

      :deep(.toolkit-fields-cascader-search),
      :deep(.toolkit-fields-dropdown-cascader .ant-cascader-menu) {
        width: 100%;
        min-width: 0;
      }
    }

    &__body--widgets {
      :deep(.toolkit-content-widgets) {
        max-height: none;
        overflow-y: visible;
      }
    }
  }
</style>
