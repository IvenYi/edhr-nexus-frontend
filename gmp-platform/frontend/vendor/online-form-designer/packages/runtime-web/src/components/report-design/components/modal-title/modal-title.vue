<template>
  <div class="flex items-center">
    <div class="text-[16px] font-600 mr12px">{{ props.name }}</div>
    <div v-if="props.field" class="field flex items-center">
      <i class="gct-iconfont icon-ziduanmingcheng text-[#1990FF]"></i>
      <span class="text-[14px] font-400 ml4px">{{ props.field }} </span>
    </div>
  </div>
</template>
<script setup lang="ts">
  const props = defineProps<{
    name: string;
    field?: string;
  }>();
</script>
<style lang="less" scoped>
  .field {
    padding: 6px;
    border-radius: 4px;
    background: rgb(25 144 255 / 10%);
  }
</style>
