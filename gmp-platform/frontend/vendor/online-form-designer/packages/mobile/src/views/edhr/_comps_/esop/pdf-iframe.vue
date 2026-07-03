<template>
  <div class="h-full">
    <iframe class="h-full w-full" :src="src" frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
  import { serverAddress } from '@mobile/stores/sessionHooks';
  import { computed } from 'vue';

  const props = defineProps<{
    url?: string;
  }>();

  const src = computed(() => {
    // return `${serverAddress.value || import.meta.env.VITE_GLOBAL_HOST}/minio${props.url}`;
    // return 'http://10.10.10.67:7777/minio///edhral3/bNDQ9kWufQLAOIY4/大疆_1_4.pdf';
    return 'http://qa-test.alpha.gct-paas.com/minio/edhral3/bNDQ9kWufQLAOIY4/%E5%A4%A7%E7%96%86.pdf';
  });
</script>
<style scoped lang="less"></style>
