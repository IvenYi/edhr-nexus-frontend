<template>
  <span class="nocode-read-only-text" :style="widget.style">{{ dynamicConfig?.visibleText }}</span>
</template>

<script setup lang="ts" name="online-form-dynro-render">
  defineProps<{
    widget: any;
    dynamicConfig?: { visibleText: string; sourceTdId: string; isDynRo: boolean };
  }>();
</script>

<style scoped></style>
