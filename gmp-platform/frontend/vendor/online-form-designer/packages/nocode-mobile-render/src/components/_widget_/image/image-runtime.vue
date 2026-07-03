<template>
  <div
    v-if="widget.value"
    class="w-full h-full flex items-center justify-center image-content"
    :class="[isInCell ? 'absolute top-0px left-0px in-cell' : 'absolute']"
    :style="{
      '--h': widget.layout.height + 'px',
      '--w': widget.layout.width + 'px',
      ...wrapperStyle,
    }"
  >
    <img :class="'image--' + widget.sizeMode" :src="transfer(widget.value!)" alt="" srcset="" />
  </div>
</template>

<script setup lang="ts">
  import { omit } from 'lodash-es';
  import { useMobileUpload } from '../../../hooks';

  const props = defineProps<{
    widget: any;
    isInCell?: boolean;
  }>();

  const { transfer } = useMobileUpload();

  const wrapperStyle = props.isInCell
    ? {}
    : Object.fromEntries(
        Object.entries(omit(props.widget.layout, ['width', 'height'])).map(([key, value]) => [
          key,
          `${value}px`,
        ]),
      );
</script>

<style lang="less" scoped>
  .image-content {
    width: var(--w);
    height: var(--h);
    &.in-cell {
      width: 100%;
      height: 100%;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;

      &.image--fixed {
        width: var(--w);
        height: var(--h);
        object-fit: fill;
      }
    }
  }
</style>
