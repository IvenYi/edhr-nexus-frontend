<template>
  <drag-box
    class="group"
    :initial-layout="layout"
    :disabled="sheetReadonly"
    @layout-change="handleLayoutChange"
  >
    <img :src="src" />
    <div
      class="hidden group-hover:flex absolute right-0 top-0 z-10 m-[2px] w-5 h-5 justify-center items-center bg-white rounded text-red-400 hover:text-red-600 active:text-red-900"
      @click="handleRemoveClick"
    >
      <i class="iconfont icon-shanchu2 cursor-pointer"></i>
    </div>
  </drag-box>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import DragBox from '../base/drag-box.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const props = defineProps<{
    id: string;
    mediaId: string;
    layout: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }>();

  const { paper, sheetReadonly, setPaper } = useSpreadSheet();

  const src = computed(() => {
    const image = (paper.value.medias ?? []).find((m) => m.id === props.mediaId);
    return image?.src;
  });

  const handleLayoutChange = (layout) => {
    const image = paper.value.images?.find((i) => i.id === props.id);
    if (!image) return;
    Object.assign(image.layout, layout);
  };

  const handleRemoveClick = () => {
    paper.value.images = (paper.value.images ?? []).filter((img) => img.id !== props.id);
    setPaper(paper.value);
  };
</script>

<style lang="less" scoped>
  img {
    height: 100%;
    width: 100%;
    user-select: none;
  }
</style>
