<template>
  <div :class="classes">
    <div :class="barConClasses">
      <i :class="`${prefix}-bar`" v-once v-for="i in 8" :key="`trigger-${i}`"></i>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-split-trigger">
  import { ref, computed } from 'vue';

  interface Props {
    mode: string;
  }

  const props = defineProps<Props>();

  const prefix = ref('gct-split-trigger');

  const isVertical = computed(() => props.mode === 'vertical');

  const classes = computed(() => [
    prefix.value,
    isVertical.value ? `${prefix.value}-vertical` : `${prefix.value}-horizontal`,
  ]);

  const barConClasses = computed(() => [
    `${prefix.value}-bar-con`,
    isVertical.value ? 'vertical' : 'horizontal',
  ]);
</script>
