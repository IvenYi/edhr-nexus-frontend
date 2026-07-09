<template>
  <BpmnBizDocument :data="data" :label="$t('sys.edhr.canHandleUser')" />
</template>
<script setup lang="ts">
  import BpmnBizDocument from './bpmnBizDocument.vue';

  defineProps<{
    data: any;
  }>();
</script>
<style lang="less" scoped></style>
