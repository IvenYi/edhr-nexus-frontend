<template>
  <div class="p-horizontal-line">
    <div
      class="p-horizontal-line-inner"
      :style="{ 'background-color': color, height: borderWidth + 'px' }"
    ></div>
  </div>
</template>

<script lang="ts" setup name="HORIZONTAL_LINE">
  defineProps({
    color: {
      type: String,
      default: '',
    },
    borderWidth: {
      type: Number,
      default: 2,
    },
  });
</script>

<style scoped>
  .p-horizontal-line {
    overflow: hidden;
    display: flex;
    align-items: center;
  }
  .p-horizontal-line-inner {
    height: 1px;
    width: 100%;
  }
</style>
