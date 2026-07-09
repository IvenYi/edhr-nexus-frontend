<template>
  <ConfigProvider :locale="getAntdLocale">
    <DndProvider :backend="HTML5Backend">
      <AppProvider>
        <RouterView />
      </AppProvider>
    </DndProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { watchEffect } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { DndProvider } from 'vue3-dnd';
  import { HTML5Backend } from 'react-dnd-html5-backend';
  import { AppProvider } from '@/components/Application';
  import { useTitle } from '@/hooks/web/useTitle';
  import { useFavicon } from '@/hooks/web/useFavicon';
  import { useLocale } from '@/locales/useLocale';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import 'dayjs/locale/zh-cn';

  // support Multi-language
  const { getAntdLocale } = useLocale();

  const locale = useLocale();
  (window as any).___GCT___ = {
    locale,
  };

  const { getWatermark } = useRootSetting();

  // Listening to page changes and dynamically changing site titles
  useTitle();
  useFavicon();

  // 水印开启
  watchEffect(() => getWatermark());
</script>
