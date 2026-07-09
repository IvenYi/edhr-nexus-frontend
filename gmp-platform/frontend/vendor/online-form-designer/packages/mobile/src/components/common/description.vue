<template>
  <div class="flex items-center text-sm leading-loose">
    <div class="flex-shrink-0 text-gray-400">{{ label }}：</div>
    <div class="flex-grow min-w-0 truncate text-black">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    label: string;
  }>();
</script>
