<template>
  <ConfigProvider :locale="getAntdLocale">
    <DndProvider :backend="HTML5Backend">
      <AppProvider>
        <RouterView>
          <template #default="{ Component, route }">
            <component :is="Component" />
          </template>
        </RouterView>
      </AppProvider>
    </DndProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { watchEffect, computed } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { DndProvider } from 'vue3-dnd';
  import { HTML5Backend } from 'react-dnd-html5-backend';
  import { AppProvider } from '/@/components/Application';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';
  import { useFavicon } from '/@/hooks/web/useFavicon';
  import 'dayjs/locale/zh-cn';

  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  // support Multi-language
  const locale = useLocale();
  (window as any).___GCT___ = {
    locale,
  };
  const { getAntdLocale } = locale;
  const { getWatermark } = useRootSetting();

  // Listening to page changes and dynamically changing site titles
  useTitle();
  useFavicon();

  // 水印开启
  watchEffect(() => getWatermark());

  // 是否为无界内打开
  const isWujie = computed(() => !!window.$wujie);

  if (isWujie.value) {
    document.documentElement.classList.add('wujie-sub-app');
  }
</script>
<style>
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
