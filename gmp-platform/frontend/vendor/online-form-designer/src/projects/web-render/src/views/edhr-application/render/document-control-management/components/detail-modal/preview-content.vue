<template>
  <ApaasCollectSheetView v-if="data.controlTmplType === 'FORM'" :dataId="data.docVersionId" />
  <div v-else class="bg-[#ffffff] h100% px12px">
    <edhrContent :edhrId="data.docVersionId" :readonly="true" class="edhr-content" />
  </div>
</template>
<script setup lang="ts">
  import { ApaasCollectSheetView } from '/@online-form/views/integration/apaas_si/index';
  import edhrContent from '/@/projects/online-form/src/views/edhr-designer/components/edhr-content.vue';

  defineProps<{
    data: any;
  }>();
</script>
<style lang="less" scoped>
  .edhr-content {
    height: calc(100% - 1px);
  }
</style>
