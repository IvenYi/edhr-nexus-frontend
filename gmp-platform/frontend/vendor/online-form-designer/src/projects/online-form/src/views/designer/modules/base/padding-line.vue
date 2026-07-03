<template>
  <div
    class="padding-line padding-line--t"
    :style="{
      top: `${paper.padding.t}mm`,
    }"
  ></div>
  <div
    class="padding-line padding-line--r"
    :style="{
      right: `${paper.padding.r}mm`,
    }"
  ></div>
  <div
    class="padding-line padding-line--b"
    :style="{
      bottom: `${paper.padding.b}mm`,
    }"
  ></div>
  <div
    class="padding-line padding-line--l"
    :style="{
      left: `${paper.padding.l}mm`,
    }"
  ></div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const { paper } = useSpreadSheet();
</script>

<style></style>
