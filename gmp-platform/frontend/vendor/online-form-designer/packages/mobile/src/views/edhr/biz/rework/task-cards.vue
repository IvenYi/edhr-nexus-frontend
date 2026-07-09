<template>
  <task-cards :hook="useRework" />
</template>
<script setup lang="ts">
  import TaskCards from '../produce/task-cards.vue';
  import { useRework } from './useRework';
</script>
<style scoped lang="less"></style>
