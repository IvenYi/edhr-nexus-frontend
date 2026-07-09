<template>
  <!-- <gct-old-workbench class="pl14px pr14px pt14px" /> -->
  <gct-workbench />
</template>
<script setup lang="ts">
  import { onMounted, onBeforeUnmount } from 'vue';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { getAid, getAppName } from '@mobile/stores/sessionHooks';
  import { routerPush } from '@mobile/router';

  const { mitt } = useMitt();
  const router = useRouter();
  onMounted(() => {
    mitt.on('open-app', ({ appId, appName }: any) => {
      getAid.value = appId;
      getAppName.value = appName;
      router.push({ name: 'menucenter', query: { title: appName, appId } });
    });
    mitt.on('open-app-menu', ({ appId, menuId, menuName, linkPageKey }: any) => {
      getAid.value = appId;
      getAppName.value = menuName;
      routerPush(linkPageKey, { menuId, menuName });
    });
  });

  onBeforeUnmount(() => {
    mitt.off('open-app');
    mitt.off('open-app-menu');
  });
</script>
