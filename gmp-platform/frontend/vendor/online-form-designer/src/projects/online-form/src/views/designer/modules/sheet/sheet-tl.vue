<template>
  <div @click="selectAll">
    <div></div>
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const { selectAll } = useSpreadSheet();
</script>

<style></style>
