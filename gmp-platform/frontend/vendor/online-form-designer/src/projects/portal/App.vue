<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '@/components/Application';
  import { useTitle } from '@/hooks/web/useTitle';
  import { useLocale } from '@/locales/useLocale';
  import 'dayjs/locale/zh-cn';
  import { useFavicon } from '/@/hooks/web/useFavicon';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { watchEffect } from 'vue';

  // support Multi-language cicd
  const { getAntdLocale } = useLocale();
  const { getWatermark } = useRootSetting();
  const locale = useLocale();
  (window as any).___GCT___ = {
    locale,
  };
  // Listening to page changes and dynamically changing site titles
  useTitle();
  useFavicon();
  // 水印开启
  watchEffect(() => getWatermark());
</script>
