<template>
  <div
    v-if="getCurrentProject === ProjectName.WEB_RENDER"
    class="tree-sider-page__tree-toggle"
    :class="{
      'tree-sider-page__tree-toggle--collapsed': menuCollapsed,
    }"
    @click="toggleMenuCollapsed"
  >
    <i class="iconfont icon-a-Leftarrow"></i>
  </div>
  <div
    v-else
    class="platform-menu__trigger"
    :class="{
      'platform-menu__trigger--collapsed': menuCollapsed,
    }"
    @click="toggleMenuCollapsed"
  >
    <left-outlined />
  </div>
</template>

<script setup lang="ts">
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';

  const { menuCollapsed, toggleMenuCollapsed } = useThemeSetting();
  const { getCurrentProject } = usePermissionStoreWithOut();
</script>

<style lang="less" scoped>
  .tree-sider-page__tree-toggle {
    display: flex;
    position: absolute;
    z-index: 999;
    top: 32px;
    right: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    transform: translate3d(50%, -50%, 0);
    transition: all 0.3s;
    border: 1px solid #d9d9d9;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    // transform: translate3d(50%, -50%, 0) rotate(180deg);

    .icon-a-Leftarrow {
      font-size: 12px;
    }
    &--collapsed {
      .icon-a-Leftarrow {
        transform: scale(0.8) rotateY(180deg);
        // transform: translate3d(50%, -50%, 0) rotate(180deg);
      }
    }
  }

  .platform-menu__trigger {
    --bg: rgba(29, 33, 41, 0.2);
    height: 26px;
    width: 14px;
    background: var(--bg);
    top: 50%;
    right: 0;
    position: absolute;
    transform: translate3d(100%, -50%, 0);
    cursor: pointer;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    .anticon {
      font-size: 12px;
      transform: scale(0.8) rotateY(0);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      height: 12px;
      width: 12px;
      left: 0;
    }
    &::before {
      top: -12px;
      background: radial-gradient(circle at 100% 0, transparent 12px, var(--bg) 12px);
    }
    &::after {
      bottom: -12px;
      background: radial-gradient(circle at 100% 100%, transparent 12px, var(--bg) 12px);
    }

    &--collapsed {
      .anticon {
        transform: scale(0.8) rotateY(180deg);
      }
    }
  }
</style>
