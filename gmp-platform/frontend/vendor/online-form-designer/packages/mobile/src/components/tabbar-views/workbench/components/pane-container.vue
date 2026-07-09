<template>
  <div class="mb-3 md:mb-4 bg-white rounded-lg">
    <!-- header -->
    <div class="flex justify-between items-center px-4 py-3 pb-0">
      <div class="text-base font-bold text-black">{{ title }}</div>
      <div><slot name="action"></slot></div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-32">
      <van-loading />
    </div>

    <Empty v-else-if="isEmpty" class="pb-4" />

    <template v-else>
      <!-- tabs -->
      <slot name="tabs"></slot>

      <!-- entry-list -->
      <div class="p-3 pb-5">
        <div class="grid grid-cols-4 gap-3" :class="renderAsPDA ? '' : 'md:grid-cols-9'">
          <slot></slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import Empty from '@mobile/components/common/empty.vue';

  defineProps<{
    title: string;
    isLoading?: boolean;
    isEmpty: boolean;
    renderAsPDA?: boolean;
  }>();
</script>
