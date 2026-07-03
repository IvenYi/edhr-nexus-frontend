<template>
  <div class="platform-logo">
    <img :src="BiLogo" alt="GCTBI" />
    <div class="h-16px w-1px bg-[#000] op-20 mr-16px"></div>
  </div>
</template>
<script lang="ts" setup>
  // import DefaultLogo from '/@/assets/images/logo.png';
  import BiLogo from '/@/assets/images/bi-logo.png';
  // import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  // const { themeSetting } = useThemeSetting();
</script>
<style lang="less" scoped>
  .platform-logo {
    display: flex;
    align-items: center;
    font-size: 16px;
    position: relative;
    img {
      width: 114px;
      height: 32px;
      object-fit: contain;
      // margin-right: 8px;
    }
    .title {
      max-width: 116px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .platform-version {
    font-size: 16px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    transform: scale(0.6);
    transform-origin: left bottom;
    margin-left: 4px;
    position: relative;
    top: -4px;
    margin-right: -24px;
  }
</style>
