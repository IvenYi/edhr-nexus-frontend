<template>
  <BpmnInspection :data="data" />
</template>
<script setup lang="ts">
  import BpmnInspection from './bpmnInspection.vue';

  defineProps<{
    data: any;
  }>();
</script>
<style lang="less" scoped></style>
