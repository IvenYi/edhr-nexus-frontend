<template>
  <van-button @click="handleClick" class="action-btn" :color="background">
    <div class="flex items-center">
      <gct-icon class="mr-8px" :value="icon" :size="28" />
      <span class="whitespace-nowrap mr-4px">{{ text }}</span>
    </div>
  </van-button>
</template>

<script setup lang="ts">
  defineProps<{
    icon: string;
    text: string;
    background: string;
  }>();

  const emit = defineEmits(['trigger']);

  const handleClick = () => {
    emit('trigger');
  };
</script>
<style scoped lang="less">
  .action-btn {
    --van-button-default-height: 76px;
    --van-button-normal-font-size: 18px;
    --van-button-radius: 10px;
  }
</style>
