<template>
  <ipadLayout :navMenusOptions="navMenus" :pathName="route.path" @routerReplace="routerReplace">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.meta.origin_name??route.name" />
    </router-view>
  </ipadLayout>
</template>

<script setup lang="ts">
  import ipadLayout from '../layout/index.vue';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { useWorkbenchHooks } from '@mobile/stores/navMenus';
  import { useAppStore } from '@mobile/stores/useAppStore';

  const { reloadApps } = useAppStore();

  const {
    navMenus,
    homePage,
    reloadMessageCount,
    updateMessageCount,
    reloadToDoCount,
    runNavMenuSelected,
  } = useWorkbenchHooks();
  const { mitt } = useMitt();
  const route = useRoute();
  const router = useRouter();
  onMounted(() => {
    if (route.name === 'main') {
      //重定向到首页
      router.replace(homePage.value);
    }
    reloadApps();
    runNavMenuSelected();
    reloadMessageCount();
    reloadToDoCount();
    mitt.on('update-message-count', (changeNum) => {
      updateMessageCount(changeNum, '/main/message');
    });
    mitt.on('process-center-todo', (changeNum) => {
      updateMessageCount(changeNum, '/main/todo');
    });
  });
  onBeforeUnmount(() => {
    mitt.off('update-message-count');
    mitt.off('process-center-todo');
  });

  function routerReplace(path: string) {
    router.replace({ path });
  }
</script>
<style scoped lang="less"></style>
