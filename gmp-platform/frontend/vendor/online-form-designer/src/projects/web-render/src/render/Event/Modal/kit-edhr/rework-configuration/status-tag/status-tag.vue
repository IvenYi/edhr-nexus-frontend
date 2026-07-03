<template>
  <a-tag v-if="tagConfig" :color="tagConfig.color">
    {{ tagConfig.text }}
  </a-tag>
  <span v-else>-</span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    status?: string;
  }>();

  const STATUS_MAP: Record<string, { color: string; textKey: string }> = {
    waiting: { color: '#737A87', textKey: 'sys.edhr.containerSnStatus.waiting' },
    running: { color: '#1890FF', textKey: 'sys.edhr.containerSnStatus.running' },
    finished: { color: '#309C41', textKey: 'sys.edhr.containerSnStatus.finished' },
    closed: { color: '#ff0000', textKey: 'sys.edhr.containerSnStatus.closed' },
    ended: { color: '#FF0000', textKey: 'sys.edhr.containerSnStatus.ended' },
  };

  const tagConfig = computed(() => {
    if (!props.status) return null;
    const config = STATUS_MAP[props.status];
    if (!config) return null;

    return {
      color: config.color,
      text: $t(config.textKey),
    };
  });
</script>
