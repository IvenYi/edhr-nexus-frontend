<template>
  <div
    class="flex-shrink-0 inline-flex justify-center items-center w-6 h-6 rounded-full border-2 border-solid bg-white"
    :class="
      checked
        ? 'border-[var(--van-primary-color)] bg-[var(--van-primary-color)]'
        : 'border-zinc-300'
    "
  >
    <dot v-if="checked" class="w-2 h-2 rounded-full bg-white" />
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    checked: boolean;
  }>();
</script>
