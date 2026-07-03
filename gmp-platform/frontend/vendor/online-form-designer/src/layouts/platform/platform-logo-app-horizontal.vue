<template>
  <div class="platform-app-logo" v-if="!isSandbox">
    <div
      class="trigger"
      :class="{
        'trigger--hover': renderToggleDrawer && !isIndependentApp,
      }"
      @click="handleToggleDrawer"
    >
      <div class="h-20px w-20px text-20px color-[#fff] overflow-hidden">
        <div class="w-40px flex items-center" v-if="renderToggleDrawer && !isIndependentApp">
          <i class="iconfont icon-zhankaiqiehuanyingyong"></i>
          <i class="iconfont icon-qiehuanyingyong"></i>
        </div>
        <i class="iconfont icon-qiehuanyingyong" v-else-if="renderToggleDrawer"></i>
      </div>
    </div>
  </div>

  <ToggleDrawer v-if="renderToggleDrawer" />
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import ToggleDrawer from './modules/toggle-drawer.vue';
  import { useToggleDrawer } from './modules/useToggleDrawer';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useDeploySetting } from '@/hooks/platform/useDeploySetting';

  const { toggleDrawer } = useToggleDrawer();
  const { isAppProd, isSandbox } = useEnv();
  const { isIndependentApp } = useDeploySetting();
  /**
   * 正式应用、测试应用支持切换功能
   */
  const renderToggleDrawer = isAppProd;

  const handleToggleDrawer = () => {
    if (isIndependentApp.value) return;
    toggleDrawer();
  };
</script>
<style lang="less" scoped>
  .trigger {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 54px;
    transition: all 0.3s;
    border-radius: 4px;
    font-size: 20px;

    .iconfont {
      font-size: 20px;
    }

    &--hover {
      cursor: pointer;

      .w-40px {
        transform: translate(-20px);
        transition: all 0.3s;
        opacity: 0.64;
      }

      &:hover {
        .w-40px {
          transform: translate(0);
          opacity: 1;
        }
      }
    }

    img {
      width: 32px;
      height: 32px;
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
  }
</style>
