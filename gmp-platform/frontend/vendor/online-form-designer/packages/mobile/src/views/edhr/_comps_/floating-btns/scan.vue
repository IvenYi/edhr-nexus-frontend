<template>
  <van-floating-bubble
    axis="xy"
    magnetic="x"
    :style="{
      '--van-floating-bubble-size': '100px',
      '--van-floating-bubble-background': 'transparent',
      overflow: 'visible',
    }"
  >
    <div
      class="floating-scan h-100px w-100px rounded-50% b-6px b-solid b-white bg--linear-gradient color-white flex flex-col items-center justify-center"
      @click="handleClick"
    >
      <van-icon name="scan" size="28" />
      <span class="text-20px mt-8px lh-none">扫描</span>
    </div>
  </van-floating-bubble>
</template>

<script setup lang="ts">
  import { GctNative } from '@native/index';

  const emit = defineEmits(['trigger']);

  const handleClick = () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        emit('trigger', value.result);
      },
    });
  };
</script>
<style lang="less">
  .floating-scan {
    box-shadow: 0 5px 20px 5px rgba(0, 0, 0, 0.15);
  }
</style>
