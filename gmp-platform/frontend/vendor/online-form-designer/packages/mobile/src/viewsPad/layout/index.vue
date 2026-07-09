<template>
  <div class="ipad-main">
    <div class="left-side" :class="appStore.getInApp ? 'bg-[#E1E4E7]' : 'bg-[#fff]'">
      <div class="h96px">
        <div class="top-logo h100%" v-if="appStore.getInApp" @click="openList">
          <div
            class="flex justify-center items-center mx-auto w-48px h-48px rounded-10px overflow-hidden"
            :style="{ background: getLogoInfo.bgColor || '#fff' }"
          >
            <vImage
              :size="getLogoInfo.logoType === LogoTypeEnum.Icon ? 24 : 48"
              :src="getLogoInfo.logo"
              :logoType="getLogoInfo.logoType"
              :color="getLogoInfo.color"
            />
          </div>
        </div>
      </div>
      <div class="gct-tabbar">
        <div
          class="gct-tabbar-item"
          :class="{ active: isActive(pathName, i.to) }"
          :key="i.to"
          v-for="i in navMenusOptions"
          @click="handleTabClick(i.to)"
        >
          <van-badge :content="i.count" max="99" :show-zero="false">
            <gct-icon :value="isActive(pathName, i.to) ? i.activeIcon : i.icon" :size="24" />
          </van-badge>
          <div class="mt8px lh-none"> {{ $t(i.title, " ") }}</div>
        </div>
      </div>
      <div class="h96px">
        <!-- <div
          v-if="appStore.isInAppPage"
          class="mb-12 mx-auto w-14 h-14 bg-white rounded-full flex justify-center items-center"
          @click="appListPopupRef?.open()"
        >
          <i class="icon gct-iconfont icon-qiehuanyingyong2 text-2xl"></i>
        </div> -->
      </div>
    </div>
    <div class="gct-content">
      <div class="gct-content-box">
        <slot></slot>
      </div>
    </div>
  </div>

  <AppListPopup ref="appListPopupRef" />
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { useAppStore } from '@mobile/stores/useAppStore';
  import AppListPopup from './app-list-popup.vue';
  import { LogoTypeEnum } from '@mobile/type';
  import { useEnv } from '@mobile/utils/useEnv';

  const appStore = useAppStore();
  const getLogoInfo = appStore.getLogoInfo;
  const { isSandbox } = useEnv();

  const props = defineProps<{
    navMenusOptions: object[];
    pathName: string;
  }>();

  const emit = defineEmits(['routerReplace']);

  const appListPopupRef = ref();

  function routerReplace(path: string) {
    emit('routerReplace', path);
  }

  function isActive(pathName: string, to: string): boolean {
    return pathName === to || pathName.startsWith(to + '/');
  }

  function handleTabClick(path: string) {
    if (isActive(props.pathName, path)) return;
    routerReplace(path);
  }
  const openList = () => {
    if (isSandbox.value) {
      return;
    }
    appListPopupRef?.value.open();
  };
</script>
<style scoped lang="less">
  .ipad-main {
    box-sizing: border-box;
    height: 100vh;
    padding-left: 96px; /* 留出tabbar的宽度 */
    background-color: #f5f6f7;
  }

  .left-side {
    display: flex;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    flex-direction: column;
    width: 96px;
    box-shadow: 0 -1px 5px rgb(0 0 0 / 10%);
    text-align: center;

    .top-logo {
      margin: 0 12px;
      padding-top: 36px;
      border-bottom: 1px solid rgb(0 0 0 / 10%);
    }
  }

  .gct-tabbar {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;

    &-item {
      display: inline-block;
      width: 80px;
      height: 90px;
      margin: 0 auto;
      margin-bottom: 8px;
      padding-top: 20px;
      border-radius: 6px;
      color: #8b8b8b;
    }

    .active {
      background-color: var(--van-primary-color-1);
      color: var(--van-primary-color);
    }
  }

  .gct-content {
    box-sizing: border-box;
    height: 100%;

    &-user {
      position: relative;
      border-radius: 8px;
      background: linear-gradient(135deg, #026ac8 0%, rgb(2 106 200 / 50%) 100%);

      &-tenant {
        position: absolute;
        top: 24px;
        left: 0;
        width: 124px;
        height: 44px;
        border-radius: 0 100px 100px 0;
        background-color: rgb(0 0 0 / 20%);
        color: #fff;
      }
    }

    &-box {
      height: 100%;
    }
  }
</style>
