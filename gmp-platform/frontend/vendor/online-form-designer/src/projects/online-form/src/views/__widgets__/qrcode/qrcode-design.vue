<template>
  <div class="w-full h-full" :class="[isInCell ? 'absolute top-0px left-0px' : '']">
    <img class="flex w-full h-full object-contain" :src="imgSrc" alt="" srcset="" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import bwipjs from 'bwip-js';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { BwipCodeTypeOptions } from '/@online-form/views/designer/enums';

  const imgSrc = ref<string>('');

  const props = defineProps<{
    widget: PaperWidget.Qrcode;
    isInCell?: boolean;
  }>();

  const text = computed(() => {
    const type = BwipCodeTypeOptions.find((t) => t.code === props.widget.codeType);
    return type?.example;
  });

  genImage();
  watch(
    () => props.widget.codeType,
    () => {
      genImage();
    },
  );

  function genImage() {
    try {
      let canvas: HTMLCanvasElement | null = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: props.widget.codeType, // 条码类型：code128
        text: text.value, // 条码内容
        scale: 3, // 条码缩放比例
        width: 20,
        height: 20, // 条码高度
      });
      imgSrc.value = canvas.toDataURL('image/png');
      canvas = null;
    } catch (err) {
      console.warn(err);
    }
  }
</script>

<style></style>
