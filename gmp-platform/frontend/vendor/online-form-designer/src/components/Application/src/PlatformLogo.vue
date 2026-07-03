<template>
  <div class="platform-logo">
    <img :src="platformLogo" />
    <span class="ml-10px text-24px font-500">{{ getPlatformName }}</span>
  </div>
</template>
<script lang="ts" setup>
import { computed, unref } from 'vue';
import { transformUrl } from '/@/components/Cropper/hooks/useFile';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import DefaultLogo from '/@/assets/images/logo.png';
import DefaultThumbnail from '/@/assets/images/logo-white-collapse.png';
const { getLoginLogo, getPlatformLogo, getPlatformThumbnail, getPlatformName } = useRootSetting();
// 平台logo
const platformLogo = computed(() => {
  return unref(getPlatformLogo) ? transformUrl(unref(getPlatformLogo)) : DefaultLogo;
});
// logo缩略图
const platformThumbnail = computed(() => {
  return unref(getPlatformThumbnail) ? transformUrl(unref(getPlatformThumbnail)) : DefaultThumbnail;
});
// 平台登录logo
const platformLoginLogo = computed(() => {
  return unref(getLoginLogo) ? transformUrl(unref(getLoginLogo)) : DefaultLogo;
});
</script>
<style lang="less" scoped>
.platform-logo {
  display: flex;
  align-items: center;

  img {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }
}
</style>
