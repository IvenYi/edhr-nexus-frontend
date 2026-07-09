<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { watchEffect } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '@/components/Application';
  import { useTitle } from '@/hooks/web/useTitle';
  import { useFavicon } from '@/hooks/web/useFavicon';
  import { useLocale } from '@/locales/useLocale';
  import 'dayjs/locale/zh-cn';

  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  // support Multi-language
  const { getAntdLocale } = useLocale();

  // support Multi-language
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
