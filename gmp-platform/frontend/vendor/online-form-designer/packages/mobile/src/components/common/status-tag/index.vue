<template>
  <div
    class="flex-shrink-0 inline-flex items-center px-2 py-[2px] border border-solid rounded-full"
    :class="props.class"
    :style="{ borderColor: style.borderColor, backgroundColor: style.backgroundColor }"
  >
    <dot class="w-2 h-2 rounded-full" :style="{ backgroundColor: style.color }" />
    <div class="ml-1 text-sm font-500">{{ text }}</div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { STATUS_COLOR_MAP, StatusType } from '.';

  const props = defineProps<{
    type: StatusType;
    text: string;
    class?: string;
  }>();

  const style = computed(() => {
    const color = STATUS_COLOR_MAP[props.type || StatusType.info];
    return {
      color,
      backgroundColor: `${color}14`, // 8%
      borderColor: `${color}80`, // 50%
    };
  });
</script>
