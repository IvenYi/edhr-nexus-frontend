<template>
  <div class="h100vh pt52px">
    <van-config-provider :theme-vars="themeVars">
      <van-nav-bar
        fixed
        :title="title"
        left-arrow
        :border="false"
        @click-left="onClickLeft"
        class="gct-nav-bar"
        :style="{
          '--van-padding-md': '18px',
        }"
      />
    </van-config-provider>
    <router-view />
  </div>
</template>

<script setup lang="ts">
  const router = useRouter();
  const route = useRoute();
  function onClickLeft() {
    router.back();
  }

  const title = ref<string>(
    (route.query.title as string) || (route.meta.title as string) || '平台',
  );

  const themeVars = {
    'nav-bar-icon-color': '#000',
  };
</script>
<style scoped lang="less">
  :deep(.van-nav-bar__title) {
    font-weight: normal;
    text-wrap: wrap;
  }

  :deep(.gct-nav-bar.van-nav-bar) {
    height: 52px;
  }
</style>
