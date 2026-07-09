<template>
  <ConfigProvider :locale="antdMap['zh-CN']">
    <RouterView />
  </ConfigProvider>
</template>

<script setup lang="ts">
  import { ConfigProvider } from 'ant-design-vue';
  import { antdMap } from '@/locales/setupI18n';
</script>
