<template>
  <div class="main">
    <router-view v-slot="{ Component, route }">
      <keep-alive>
        <component :is="Component" :key="route.name" />
      </keep-alive>
    </router-view>
    <van-tabbar route inactive-color="#666">
      <van-tabbar-item replace :to="i.to" :key="i.to" v-for="i in navMenus" :badge="getCount(i)">
        {{ i.title }}
        <template #icon="{ active }">
          <gct-icon :value="active ? i.activeIcon : i.icon" :size="24" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { useWorkbenchHooks } from '@mobile/stores/navMenusForEDHR';

  const { navMenus, homePage, reloadMessageCount, updateMessageCount } = useWorkbenchHooks();
  const { mitt } = useMitt();
  const route = useRoute();
  const router = useRouter();
  const getCount = (item) => {
    if (item.count) {
      return item.count > 99 ? '99+' : item.count;
    } else {
      return null;
    }
  };
  onMounted(() => {
    if (route.name === 'eDHR') {
      //重定向到首页
      router.replace(homePage.value);
    }
    reloadMessageCount();
    mitt.on('update-message-count', (changeNum) => {
      if (changeNum) {
        updateMessageCount(changeNum);
      } else {
        reloadMessageCount();
      }
    });
  });
  onBeforeUnmount(() => {
    mitt.off('update-message-count');
  });
</script>
<style scoped lang="less">
  .main {
    box-sizing: border-box;
    height: 100vh;
    padding-bottom: 60px;
    overflow: hidden;
    background-color: #fafafa;
  }
</style>
