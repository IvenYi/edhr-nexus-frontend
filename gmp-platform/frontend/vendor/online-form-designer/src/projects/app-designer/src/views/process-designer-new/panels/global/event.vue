<template>
  <EventConfig :node="node" />
</template>
<script setup lang="ts">
  import EventConfig from '../../components/event-config.vue';
  import { Global } from '../../hook/useProcess';

  defineProps<{
    node: Global;
  }>();
</script>
<style lang="less" scoped></style>
