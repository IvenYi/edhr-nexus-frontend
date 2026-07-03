<template>
  <TaskRunDetail :hook="useProduceRun" />
</template>
<script setup lang="ts">
  import TaskRunDetail from '../rework/task-run-detail.vue';
  import { useProduceRun } from './useProduceRun';
</script>
<style scoped lang="less"></style>
