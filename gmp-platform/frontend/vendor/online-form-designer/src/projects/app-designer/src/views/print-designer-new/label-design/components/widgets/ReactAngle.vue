<template>
  <div :style="{ borderWidth: borderWidth + 'px' }"> </div>
</template>

<script setup lang="ts" name="RECTANGLE">
  //
  defineProps({
    borderWidth: {
      type: Number,
      default: 2,
    },
  });
</script>

<style scoped></style>
