<template>
  <div class="h100vh pt52px">
    <van-config-provider :theme-vars="themeVars">
      <van-nav-bar
        fixed
        :title="title"
        left-arrow
        :border="false"
        @click-left="onClickLeft"
        @click-right="onClickRight"
        :class="{
          'gct-nav-bar': true,
          'enable-header-theme': pageDataforJson.pageStyle?.enableHeaderBGColor,
        }"
        :style="{
          '--van-padding-md': '18px',
        }"
      >
        <template #right>
          <van-icon v-if="route.meta.closeIcon" name="cross" size="16" />
        </template>
      </van-nav-bar>
    </van-config-provider>
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="pageCaches">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
  import { getPageTitle, pageDataforJson } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { usePageCaches } from '@mobile/utils/cachePage';
  import { GlobaAppInfo } from '/@web-render/render/Event/utils/appRedis';
  import { getAid, getAppName } from '@mobile/stores/sessionHooks';
  import { getEnvCode } from '../utils/useEnv';
  import { UserData } from '@mobile/stores/loginHooks';
  import { initPremission } from '/@web-render/utils/UserappPermissions';
  import { initMqttApp } from '@mobile/stores/loginHooks';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  GlobaAppInfo.runApp({
    userInfo: UserData.value,
    env: getEnvCode(),
    aid: getAid.value,
  });
  const router = useRouter();
  const route = useRoute();
  const { pageCaches, clearAll } = usePageCaches();

  initMqttApp();

  function onClickLeft() {
    // if (route.name === 'menucenter') {
    //   router.replace({
    //     name: 'main',
    //   });
    // } else
    router.back();
  }
  async function onClickRight() {
    router.push({
      name: 'menucenter',
      query: { title: getAppName.value },
      replace: true,
    });
  }
  const title = toRef<string>(() => {
    const { title, menuName } = route.query;
    return (
      <string>title ||
      getPageTitle.value ||
      menuName ||
      route.meta.title ||
      pageDataforJson.value.pageName ||
      '冠骋云'
    );
  });
  const themeVars = {
    'nav-bar-icon-color': '#000',
  };

  onUnmounted(() => {
    clearAll();
  });
  onMounted(() => {
    const { mitt } = useMitt();
    mitt.emit('mqtt-app-exit');
    initPremission();
  });
</script>
<style scoped lang="less">
  .enable-header-theme {
    background-color: var(--van-primary-color);
    color: #fff;

    :deep(.van-nav-bar__title) {
      --van-nav-bar-title-text-color: #fff;
    }

    :deep(.van-icon) {
      --van-nav-bar-icon-color: #fff;
    }
  }

  :deep(.van-nav-bar__title) {
    font-weight: normal;
  }

  :deep(.gct-nav-bar.van-nav-bar) {
    height: 52px;
  }
</style>
