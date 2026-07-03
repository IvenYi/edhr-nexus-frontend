<template>
  <div class="flex justify-center items-center" :class="props.class">
    <div class="p-2">
      <img :src="iconSrc" :style="{ width: size + 'px', height: size + 'px' }" />
      <div class="-mt-1 text-center text-sm text-[#5A5F6B]">{{ tip }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import svgNoData from '@mobile/assets/svg/nodata.svg';
  import svgNoDataSearch from '@mobile/assets/svg/nodata-search.svg';

  const props = withDefaults(
    defineProps<{
      tip: string;
      size: number;
      class: string;
      iconType?: 'search';
    }>(),
    {
      tip: '暂无数据',
      size: 120,
      class: '',
    },
  );

  const iconSrc =
    {
      search: svgNoDataSearch,
    }[props.iconType] || svgNoData;
</script>
