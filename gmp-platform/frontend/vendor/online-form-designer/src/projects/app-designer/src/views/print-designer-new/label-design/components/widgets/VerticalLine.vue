<template>
  <div class="p-vertical-line">
    <div
      class="p-vertical-line-inner"
      :style="{ 'background-color': color, width: borderWidth + 'px' }"
    ></div>
  </div>
</template>

<script lang="ts" setup name="VERTICAL_LINE">
  defineProps({
    color: {
      type: String,
    },
    borderTickness: {
      type: String,
    },
    borderWidth: {
      type: Number,
    },
  });
</script>

<style scoped>
  .p-vertical-line {
    /* overflow: hidden; */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .p-vertical-line-inner {
    width: 1px;
    height: 100%;
  }
</style>
