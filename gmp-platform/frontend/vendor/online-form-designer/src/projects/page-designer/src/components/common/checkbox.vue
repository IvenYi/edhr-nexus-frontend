<template>
  <div
    class="flex-shrink-0 inline-flex justify-center items-center w-6 h-6 rounded-sm border-2 border-solid bg-white"
    :class="
      checked
        ? 'border-[var(--van-primary-color)] bg-[var(--van-primary-color)]'
        : 'border-zinc-300'
    "
  >
    <i v-if="checked" class="icon gct-iconfont icon-fuxuankuang-duigou text-sm text-white"></i>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    checked: boolean;
  }>();
</script>
