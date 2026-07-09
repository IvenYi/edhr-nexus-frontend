<template>
  <div>
    <IconNext :size="18" :value="getIcon" color="currentcolor" />
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { IconNext } from '/@/components/Icon';

  const props = defineProps<{
    data: any;
  }>();

  const getIcon = computed(() => props.data?.icon || props.data?.meta?.icon || false);
</script>
