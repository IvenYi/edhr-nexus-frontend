<template>
  <div class="main">
    <router-view v-slot="{ Component, route }">
      <!-- <keep-alive> -->
      <component :is="Component" :key="route.name" />
      <!-- </keep-alive> -->
    </router-view>
    <van-tabbar class="tabbar" route inactive-color="#666">
      <van-tabbar-item
        replace
        :to="i.to"
        :key="i.to"
        v-for="i in navMenus"
        :badge="i.count"
        :badge-props="{ max: 99, showZero: false }"
      >
        {{ $t(i.title) }}
        <template #icon="{ active }">
          <gct-icon :value="active ? i.activeIcon : i.icon" :size="24" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
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
    reloadApps();
    if (route.name === 'main') {
      //重定向到首页
      router.replace(homePage.value);
    }
    runNavMenuSelected();
    reloadMessageCount();
    reloadToDoCount();
    mitt.on('update-message-count', (changeNum) => {
      console.log('update-message-count', changeNum);
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
</script>
<style scoped lang="less">
  .main {
    box-sizing: border-box;
    height: 100vh;
    padding-bottom: 60px;
    overflow: hidden;
    background-color: #f5f6f7;
    color: #666;
  }

  .van-tabbar.van-tabbar--fixed.van-hairline--top-bottom.tabbar {
    position: fixed;
  }
</style>
