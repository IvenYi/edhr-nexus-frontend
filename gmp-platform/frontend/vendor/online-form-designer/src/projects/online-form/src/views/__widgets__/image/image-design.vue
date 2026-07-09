<template>
  <div
    class="w-full h-full flex items-center justify-center"
    :class="[isInCell ? 'absolute top-0px left-0px' : '']"
  >
    <img
      :style="{
        '--h': widget.layout.height + 'px',
        '--w': widget.layout.width + 'px',
      }"
      :class="'image--' + widget.sizeMode"
      :src="transfer(widget.value!)"
      alt=""
      srcset=""
    />
  </div>
</template>

<script setup lang="ts">
  import { useWebUpload } from '@gct/nocode-web-render';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  defineProps<{
    widget: PaperWidget.Image;
    isInCell?: boolean;
  }>();

  const { transfer } = useWebUpload();
</script>

<style lang="less" scoped>
  img {
    height: 100%;
    width: 100%;
    object-fit: contain;

    &.image--fixed {
      object-fit: fill;
      height: var(--h);
      width: var(--w);
    }
  }
</style>
