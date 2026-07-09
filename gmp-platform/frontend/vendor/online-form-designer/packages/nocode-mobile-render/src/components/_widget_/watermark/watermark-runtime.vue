<template>
  <div class="watermark-wrapper" :style="widget.styles">
    <div class="w-full h-full">
      <img :src="widget.value" alt="" srcset="" />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    inheritAttrs: false,
  });
  defineProps<{
    widget: any;
  }>();
</script>

<style lang="less" scoped>
  .watermark-wrapper {
    position: absolute;
    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }
</style>
