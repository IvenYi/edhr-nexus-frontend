<template>
  <div class="h100% w100% bg-[#E6E9EF]">
    <document-view v-if="id" :dataId="id" model="em_circulation_document" />
  </div>
</template>
<script setup lang="ts">
  import DocumentView from '/@online-form/views/integration/apaas_dp/designer/apaas-dp-print-sheet-view.vue';

  defineProps<{
    id: string;
  }>();
</script>
<style lang="less" scoped></style>
