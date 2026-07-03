<!--
 * @Author: wangming
 * @Date: 2022-06-02 15:12:16
 * @LastEditors: wangming
 * @LastEditTime: 2022-12-01 15:41:33
 * @FilePath: /vant-app/src/App.vue
 * @Description: 
-->
<template>
  <router-view :key="refreshKey" />
</template>

<script lang="ts" setup>
  import { useplatSetting } from './utils/useplatSetting';

  const a = ref('');

  const { getAppPlat, setPassTheme } = useplatSetting();
  const route = useRoute();
  getAppPlat().then(() => {
    setPassTheme();
  });
  const refreshKey = ref();
  onBeforeMount(async () => {
    // iframe页面给父页面发送消息
    window.parent.postMessage(
      { type: 'parent', cmd: 'pageMountSuccess', params: { result: 'ok' } },
      '*',
    );
  });
  watch(route, (v) => {
    if (route.query.refreshKey) {
      refreshKey.value = Math.random();
    }
  });
</script>

<style>
  .primary-color {
    color: var(--van-primary-color);
  }

  .danger-color {
    color: var(--van-danger-color);
  }

  html,
  body,
  #app {
    height: 100vh;
  }
</style>
