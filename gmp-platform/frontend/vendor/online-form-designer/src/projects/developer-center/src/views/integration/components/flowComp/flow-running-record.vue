<template>
  <div class="h-full flex flex-col p16px">
    <LogTable :params="{ keyOrName: ckey }" />
  </div>
</template>
<script setup lang="ts">
  import LogTable from './comps/log-table.vue';

  defineProps<{
    ckey: string;
  }>();
</script>
<style lang="less" scoped></style>
