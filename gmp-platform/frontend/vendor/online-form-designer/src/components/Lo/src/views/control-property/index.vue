<template>
  <component :is="dynamicImport[compName]" :form-state="formState" />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import dynamicImport from './dynamicImport';

  const props = defineProps<{
    name: string;
    formState: Object;
  }>();

  const compName = computed(() => {
    return props.name.replace(/[A-Z]/g, (s) => '-' + s.toLowerCase());
  });
</script>

<style></style>
