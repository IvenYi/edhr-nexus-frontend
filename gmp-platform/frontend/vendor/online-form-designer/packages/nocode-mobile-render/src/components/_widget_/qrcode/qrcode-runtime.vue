<template>
  <div
    :id="widget.id"
    class="w-full h-full"
    :class="[isInCell ? 'absolute top-0px left-0px' : 'absolute']"
    :style="wrapperStyle"
  >
    <img class="flex w-full h-full object-contain" :src="imgSrc" alt="" srcset="" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import bwipjs from 'bwip-js';

  const props = defineProps<{
    widget: any;
    modelValue: any;
    isInCell?: boolean;
  }>();

  const imgSrc = ref<string>('');

  const wrapperStyle = Object.entries(props.widget.layout)
    .map(([key, value]) => `${key}: ${value}px;`)
    .join(' ');

  const barcodeOptions = {
    bcid: props.widget.codeType, // 条码类型
    scale: 3, // 条码缩放比例
    width: 20,
    height: 20, // 条码高度
  };

  const text = computed(() => {
    const value = props.modelValue;
    return typeof value === 'boolean' || typeof value === 'number' ? `${value}` : value || '';
  });

  function genImage() {
    if (!text.value) return;

    try {
      let canvas: any = document.createElement('canvas'); // 创建临时 canvas
      bwipjs.toCanvas(canvas, {
        ...barcodeOptions, // 静态参数
        text: text.value, // 动态内容
      });
      imgSrc.value = canvas.toDataURL('image/png'); // 生成图片 URL
      canvas = null;
    } catch (err) {
      console.warn('Error generating barcode image:', err);
    }
  }
  genImage();

  watch(text, genImage);
</script>

<style scoped></style>
