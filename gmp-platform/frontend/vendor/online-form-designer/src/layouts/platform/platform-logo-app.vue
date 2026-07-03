<template>
  <div class="platform-app-logo">
    <div
      class="trigger"
      :class="{
        'trigger--hover': !isHorizontal && renderToggleDrawer && !isIndependentApp,
        'horizontal-trigger': isHorizontal,
      }"
      @click="handleToggleDrawer"
    >
      <div
        class="h-16px w-16px text-16px mr-12px color-[#fff] overflow-hidden"
        v-if="!isHorizontal && renderToggleDrawer && !isIndependentApp && !isSandbox"
      >
        <div class="w-32px flex items-center">
          <i class="iconfont icon-zhankaiqiehuanyingyong"></i>
          <i class="iconfont icon-qiehuanyingyong"></i>
        </div>
      </div>
      <div v-show="themeSetting.showLogo" class="mr-8px">
        <img
          v-if="appInfoStore.appInfo.logoType === 'IMAGE'"
          class="max-w-full"
          :src="'/minio/' + appInfoStore.appInfo.logo"
        />
        <icon-next v-else :value="appInfoStore.appInfo.logo" :size="32" />
      </div>
      <div class="title" v-if="appInfoStore.appInfo.logoType !== 'IMAGE'">{{
        appInfoStore.appInfo.name
      }}</div>
    </div>
  </div>
  <ToggleDrawer v-if="renderToggleDrawer" />
</template>
<script lang="ts" setup>
  import { computed, inject } from 'vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import IconNext from '@/components/Icon/src/IconNext.vue';
  import ToggleDrawer from './modules/toggle-drawer.vue';
  import { useToggleDrawer } from './modules/useToggleDrawer';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useDeploySetting } from '@/hooks/platform/useDeploySetting';

  const appInfoStore = useAppInfoStore();
  const { toggleDrawer } = useToggleDrawer();
  const { isAppProd, isSandbox } = useEnv();
  const { themeSetting } = useThemeSetting();
  const { isIndependentApp } = useDeploySetting();
  const isHorizontal = inject('isHorizontal') as Boolean;

  /**
   * 正式应用、测试应用支持切换功能
   */
  const renderToggleDrawer = isAppProd;

  const handleToggleDrawer = () => {
    if (isIndependentApp.value) return;
    !isHorizontal?.value && toggleDrawer();
  };
</script>
<style lang="less" scoped>
  .platform-app-logo {
    width: v-bind("themeSetting.menuWidth + 'px'");
    padding-left: 8px;
  }

  .trigger {
    display: flex;
    position: relative;
    align-items: center;
    height: 40px;
    padding-left: 6px;
    transition: all 0.3s;
    border-radius: 4px;
    font-size: 16px;

    &--hover {
      cursor: pointer;

      .w-32px {
        transform: translate(-16px);
        transition: all 0.3s;
        opacity: 0.64;
      }

      &:hover {
        background: rgb(255 255 255 / 15%);

        .w-32px {
          transform: translate(0);
          opacity: 1;
        }
      }
    }

    img {
      height: 40px;
      object-fit: contain;
    }

    .title {
      display: block;
      max-width: 116px;
      overflow: hidden;
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.horizontal-trigger {
      .title {
        max-width: calc(100% - 20px);
      }
    }
  }
</style>
