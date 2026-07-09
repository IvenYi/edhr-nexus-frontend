<template>
  <tr ref="TrRef">
    <slot></slot>
  </tr>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useResizeObserver } from '/@online-form/views/designer/hooks/useResizeObserver';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  // import { debounce } from 'lodash-es';

  const TrRef = ref();
  const { observe, unobserve } = useResizeObserver();
  const { paper } = useSpreadSheet();

  // const callback = (entry) => {
  //   const index = Number((entry.target as HTMLElement).dataset.y) - 1;
  //   Object.assign(paper.value.rows[index], {
  //     height: entry.contentRect.height,
  //   });
  // };
  // // const callbackDebounce = debounce(callback, 150);

  // onMounted(() => {
  //   observe(TrRef.value, callback);
  // });

  // onBeforeUnmount(() => {
  //   unobserve(TrRef.value);
  // });
</script>

<style></style>
