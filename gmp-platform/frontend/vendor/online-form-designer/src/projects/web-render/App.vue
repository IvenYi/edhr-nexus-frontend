<template>
  <ConfigProvider :locale="antdLocale">
    <RouterView />
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { onBeforeMount } from 'vue';
  import { ConfigProvider, message } from 'ant-design-vue';
  import { antdLocale } from './local-i18n';
  import 'dayjs/locale/zh-cn';

  message.config({
    top: `50px`,
  });

  (window as any).___GCT___ = {
    locale: {
      getLocale: 'zh-CN',
      getAntdLocale: antdLocale,
    },
  };

  onBeforeMount(() => {
    window.parent.postMessage(
      { type: 'parent', cmd: 'pageMountSuccess', params: { result: 'ok' } },
      '*',
    );
  });
</script>
