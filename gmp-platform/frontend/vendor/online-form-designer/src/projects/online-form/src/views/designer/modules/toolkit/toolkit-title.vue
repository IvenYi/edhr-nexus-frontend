<template>
  <div class="toolkit-title">
    <span>
      {{ title }}
    </span>

    <span class="close" @click="emit('close')">
      <double-right-outlined />
    </span>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
  }>();

  const emit = defineEmits(['close']);
</script>

<style lang="less" scoped>
  .toolkit-title {
    height: 34px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #212528;
    font-size: 12px;
    font-weight: 500;
    background: #d4d9e2;

    .close {
      cursor: pointer;
      height: 24px;
      width: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
</style>
