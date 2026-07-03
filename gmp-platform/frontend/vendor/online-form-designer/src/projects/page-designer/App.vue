<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <DndProvider :backend="HTML5Backend">
        <page-designer-new />
      </DndProvider>
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { watchEffect, computed } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '@/components/Application';

  import { useLocale } from '@/locales/useLocale';
  // import PageDesigner from '/@page-designer/designer/designer.vue';
  import PageDesignerNew from '/@page-designer/designer/designer-view';

  import { DndProvider } from 'vue3-dnd';
  import { HTML5Backend } from 'react-dnd-html5-backend';

  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  const locale = useLocale();
  const { getAntdLocale } = locale;
  const { getWatermark } = useRootSetting();

  (window as any).___GCT___ = {
    locale,
  };

  // 水印开启
  watchEffect(() => getWatermark());
  // 是否为无界内打开
  const isWujie = computed(() => !!window.$wujie);

  if (isWujie.value) {
    document.documentElement.classList.add('wujie-sub-app');
  }
</script>
<style>
  :root {
    --van-primary-color: var(--ant-primary-color) !important;

    overflow: hidden;
  }

  .gct-save-loading {
    .ant-message-notice-content {
      padding: 8px 12px;
      border-radius: 6px;
      background-color: #000;
      color: #fff;

      .anticon {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
