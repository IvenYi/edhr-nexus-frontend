<template>
  <div class="fullscreen-toggle">
    <a-tooltip
      :title="isFullscreen ? t('sys.tooltipExitFull') : t('sys.tooltipEntryFull')"
      placement="bottom"
      :trigger="isTouchDevice ? 'contextMenu' : 'hover'"
    >
      <div class="icon-wrapper" @click="handleToggleFullscreen">
        <i
          :class="isFullscreen ? 'gct-iconfont icon-quxiaoquanping' : 'gct-iconfont icon-quanping'"
        ></i>
      </div>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useFullscreen } from '@vueuse/core';

  const { t } = useI18n();
  const { isFullscreen, toggle } = useFullscreen();

  // 检测是否为触摸设备
  const isTouchDevice = computed<boolean>(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  const handleToggleFullscreen = (): void => {
    toggle();
  };
</script>

<style lang="less">
  @import url('/@/layouts/platform/style/icon-wrapper.less');
</style>
