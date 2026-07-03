<template>
  <div>
    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.menu.processCenter') }}</span>
      </template>
      <div class="icon-wrapper" @click="handleGo">
        <i class="iconfont icon-shenpi1"></i>
      </div>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { usePermissionStore } from '/@/store/modules/permission';
  import { PageEnum } from '/@/enums/pageEnum';
  import { ProjectName } from '@/enums/appEnum';
  import { useGo } from '/@/hooks/web/usePage';

  const permissionStore = usePermissionStore();
  const go = useGo();

  const handleGo = () => {
    if (permissionStore.getCurrentProject === ProjectName.PORTAL) {
      go(PageEnum.PROCESS_CENTER);
    } else {
      window.location.href = `${location.origin}${import.meta.env.VITE_PATHNAME_PROTAL}#${
        PageEnum.PROCESS_CENTER
      }`;
    }
  };
</script>

<style lang="less">
  @import url('/@/layouts/platform/style/icon-wrapper.less');
</style>
