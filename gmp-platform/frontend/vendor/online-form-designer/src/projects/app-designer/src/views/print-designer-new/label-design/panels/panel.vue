<template>
  <div>
    <component :is="panelComps[panelName]" />
    <diff-modal @register="registerDiff" />
  </div>
</template>

<script lang="ts" setup>
  import { provide, computed } from 'vue';
  import { useDesigner } from '../hooks/useDesigner';
  import panelComps from './index';
  import { useModal } from '/@/components/Modal';
  import diffModal from './modals/diff-modal.vue';

  const [registerDiff, { openModal: openDiffModal }] = useModal();

  provide('openDiffModal', openDiffModal);
  const { currentPanel } = useDesigner();
  const panelName = computed(() => {
    return 'panel-' + currentPanel.value;
  });
</script>

<style lang="less" scoped></style>
