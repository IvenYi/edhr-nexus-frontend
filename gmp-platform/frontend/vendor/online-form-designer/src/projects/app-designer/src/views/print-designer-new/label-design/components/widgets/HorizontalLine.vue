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
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .p-horizontal-line-inner {
    width: 100%;
    height: 1px;
  }
</style>
