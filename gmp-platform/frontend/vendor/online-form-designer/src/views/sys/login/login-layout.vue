<template>
  <div :class="prefixCls">
    <img :class="[`${prefixCls}__logo`, '-enter-x']" :src="loginLogo" />
    <div :class="[`${prefixCls}__main`, getLoginTheme]">
      <div :class="[`${prefixCls}__form`]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, unref } from 'vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import DefaultBanner from '/@/assets/images/login-bg.png';
  import DefaultLogo from '/@/assets/images/logo2.png';

  const prefixCls = 'login-layout';
  const { getLoginTheme, getLoginBanner, getLoginLogo } = useRootSetting();

  // 平台登录logo
  const loginLogo = computed(() => {
    return unref(getLoginLogo) ? transformUrl(unref(getLoginLogo)) : DefaultLogo;
  });

  const banner = computed(() => {
    const banner = unref(getLoginBanner) ? transformUrl(unref(getLoginBanner)) : DefaultBanner;
    return `url('${banner}')`;
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'login-layout';

  .@{prefix-cls} {
    width: 100vw;
    height: 100vh;
    background-image: v-bind(banner);
    background-size: cover;
    position: relative;
    min-height: 720px;
    &__logo {
      width: 180px;
      position: absolute;
      top: 50px;
      left: 140px;
    }

    &__main {
      background: #ffffff;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;

      &.class {
        background: rgba(255, 255, 255, 0.8);
        height: 100%;
        width: 40%;
        top: 0;
        right: 0;
      }
      &.full {
        top: 50%;
        transform: translateY(-50%);
        right: 10vw;
        box-shadow: 0px 2px 20px 0px #e4e9f6;
        border-radius: 10px;
      }
    }

    &__form {
      max-height: 90vh;
      height: 646px;
      width: 502px;
      position: relative;
      min-height: 640px;
    }
  }
</style>
