<template>
  <QueryCards :hook="useRework" />
</template>
<script setup lang="ts">
  import QueryCards from '../produce/query-cards.vue';
  import { useRework } from './useRework';
</script>
<style scoped lang="less"></style>
