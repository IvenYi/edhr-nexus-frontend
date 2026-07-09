<template>
  <span class="nocode-read-only-text" :style="widget.style">{{ widget.props.value }}</span>
</template>

<script setup lang="ts" name="online-form-ro-render">
  import type { IRO } from '@gct/nocode-base';

  defineProps<{ widget: IRO }>();
</script>

<style scoped></style>
