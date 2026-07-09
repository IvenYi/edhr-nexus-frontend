<template>
  <task-detail :hook="useRework" />
</template>
<script setup lang="ts">
  import TaskDetail from '../produce/task-detail.vue';
  import { useRework } from './useRework';
</script>
<style scoped lang="less"></style>
