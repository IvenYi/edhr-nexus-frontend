<template>
  <!-- <gct-old-workbench class="pl14px pr14px pt14px" /> -->
  <gct-workbench />
</template>
<script setup lang="ts">
  import { onMounted, onBeforeUnmount } from 'vue';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { useAppStore } from '@mobile/stores/useAppStore';

  const appStore = useAppStore();
  const { mitt } = useMitt();
  const router = useRouter();
  onMounted(() => {
    mitt.on('open-app', async (data: any) => {
      await appStore.pushApp(data.appId);
      router.push({
        name: 'appMenu',
        query: { refreshKey: new Date().getTime() },
      });
    });
    mitt.on('open-app-menu', async (data: any) => {
      const { appId, menuId } = data;
      await appStore.pushApp(appId);
      router.push({
        name: 'appMenu',
        query: { refreshKey: new Date().getTime(), menuId },
      });
    });
  });

  onBeforeUnmount(() => {
    mitt.off('open-app');
    mitt.off('open-app-menu');
  });
</script>
