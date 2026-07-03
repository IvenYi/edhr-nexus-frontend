<template>
  <design-render
    v-if="model"
    :context="context"
    :prefix="DesignRenderViewPrefix.CUSTOM_HOME"
    :model="model"
  />
</template>

<script setup lang="ts">
  import { DesignRenderViewPrefix } from '@gct/runtime-render';
  import { getNavPageInfo } from '/@/apis/gct-platform/NavPageController';
  import { getAid, getAppName } from '@mobile/stores/sessionHooks';
  import { UserData } from '@mobile/stores/loginHooks';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { routerPush } from '@mobile/router';

  const { mitt } = useMitt();
  const router = useRouter();
  const route = useRoute();
  const id = ref();
  const context = {
    aid: getAid.value,
    UserData: UserData.value,
  };
  const model = ref();
  onMounted(async () => {
    const data = await getNavPageInfo({ id: route.name });
    model.value = JSON.parse(data.designerJson);
  });

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
<style scoped lang="less"></style>
