<template>
  <div class="readonly-widget">
    <span v-if="textValue">{{ textValue }}</span>
    <span v-else>--</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    value?: string;
    modelValue?: string;
    rowValue?: any;
    dict?: any;
  }>();

  const textValue = computed(() => {
    return props.modelValue || props.value;
  });
</script>
