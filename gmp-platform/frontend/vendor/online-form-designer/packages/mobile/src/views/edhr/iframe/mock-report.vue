<template>
  <MobileMockReport v-bind="params" />
</template>

<script setup lang="ts" name="mock-report">
  import { reactive, ref } from 'vue';
  import { MobileMockReport } from '@gct/nocode-mobile-render';

  const route = useRoute();

  const params = reactive<{
    /** 模板id */
    selfId: string;
  }>({
    selfId: route.query.tid as string,
  });
</script>

<style scoped lang="less">
  .mock-report {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
