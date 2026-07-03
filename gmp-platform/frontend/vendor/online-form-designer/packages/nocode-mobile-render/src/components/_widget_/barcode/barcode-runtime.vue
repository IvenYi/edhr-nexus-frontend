<template>
  <div
    class="widget-barcode h-full w-full"
    :class="[isInCell ? 'absolute top-0px left-0px' : 'absolute']"
    :style="widgetStyle"
  >
    <div class="wrapper canvas-wrapper" :id="widget.id">
      <canvas ref="canvasRef"></canvas>
      <div class="text" v-if="props.widget.showValue">{{ text }}</div></div
    >
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import bwipjs from 'bwip-js';
  import { BwipCodeType } from '@gct/nocode-base';

  const props = defineProps<{
    widget: any;
    modelValue: any;
    isInCell?: boolean;
  }>();

  const canvasRef = ref();

  const alignStyle = props.widget.styles?.justifyContent
    ? {
        display: 'flex',
        justifyContent: props.widget.styles.justifyContent,
      }
    : {};

  const widgetStyle = {
    ...Object.fromEntries(
      Object.entries(props.widget.layout).map(([key, value]) => [key, `${value}px`]),
    ),
    ...alignStyle,
  };

  const bwipOptions = {
    bcid: props.widget.codeType,
    scale: 1, // 条码缩放比例
    height: 100, // 条码高度
  };

  // todo null undefiend '' 多选 单选 兼容
  const text = computed(() => {
    let text = props.modelValue;

    if (typeof text === 'boolean' || typeof text === 'number') {
      text = `${text}`;
    }

    if (props.widget.codeType === BwipCodeType.Code39) {
      text = text?.toLocaleUpperCase();
    }

    return text;
  });

  watch([canvasRef, text], ([el, textValue]) => {
    if (!el || !textValue) return;
    try {
      bwipjs.toCanvas(el, {
        ...bwipOptions,
        text: textValue, // 条码内容
      });
    } catch (err) {
      console.warn(err);
    }
  });
</script>

<style lang="less" scoped>
  .widget-barcode {
    .wrapper {
      text-align: center;
      font-size: 12px;
      white-space: nowrap;
      line-height: 1em;
      height: 100%;
      width: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      overflow: hidden;
      flex: none;
    }

    .text {
      margin-top: 2px;
    }
  }
</style>
