<template>
  <router-view :key="refreshKey" />
</template>

<script lang="ts" setup>
  import { GctDialog } from '@mobile/utils/dialog';
  import { GctPopup } from '@mobile/utils/popup';
  import { useplatSetting } from '@mobile/utils/useplatSetting';

  const { getAppPlat, setPassTheme } = useplatSetting();
  const route = useRoute();
  getAppPlat().then(() => {
    /**主题色暂时写死蓝色 */
    setPassTheme('#026AC8');
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

  const app = getCurrentInstance();
  GctDialog.rootApp = app;
  GctPopup.rootApp = app;
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
