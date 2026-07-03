<template>
  <div class="overflow-hidden" ref="ContainerRef">
    <div
      class="inline-flex"
      :style="{
        transform: `translateX(${distX}px)`,
      }"
      ref="ContentRef"
    >
      <div
        class="not-last-mr-20px h-56px min-w-140px rounded-8px color-1 text-18px flex items-center justify-center pl-24px pr-24px ellipsis flex-none"
        :class="tab.id === queryCardKey ? 'bg--linear-gradient color-white' : 'bg-white color--1'"
        v-for="tab in queryCards"
        :key="tab.id"
        @click="toggleQueryCard(tab.id)"
      >
        <gct-icon v-if="tab.icon" class="mr-8px relative" :value="tab.icon" :size="18" />
        <span class="mr-6px">{{ tab.name }}</span>
        <span class="w-32px">{{ tab._total ?? '--' }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useProduce } from './useProduce';
  import GctIcon from '@mobile/components/icon/index.vue';
  import { useDragX } from '@mobile/views/edhr/_hooks_/useDragX';

  const props = defineProps<{
    hook?: Function;
  }>();

  const ContainerRef = ref<HTMLElement>();
  const ContentRef = ref<HTMLElement>();
  const { loadQueryCards, queryCards, toggleQueryCard, queryCardKey } = (
    props.hook ?? useProduce
  )();
  loadQueryCards();

  const { distX } = useDragX(ContainerRef, ContentRef);
</script>
<style scoped lang="less"></style>
