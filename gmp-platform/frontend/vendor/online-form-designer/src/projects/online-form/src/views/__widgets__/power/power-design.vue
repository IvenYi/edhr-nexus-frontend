<template>
  <div class="power-widget" :data-placeholder="$t('sys.onlineForm.group')"> </div>
</template>

<script setup lang="ts">
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  defineProps<{
    widget: PaperWidget.Power;
  }>();
</script>

<style lang="less" scoped>
  .power-widget {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    &::before {
      content: attr(data-placeholder);
      position: absolute;
      top: 0;
      right: 0;
      color: #fff;
      font-size: 12px;
      pointer-events: none;
      z-index: 9;
      background: #7cdfc3;
      padding: 2px 10px;
      border-bottom-left-radius: 4px;
      line-height: 18px;
    }
  }
</style>
