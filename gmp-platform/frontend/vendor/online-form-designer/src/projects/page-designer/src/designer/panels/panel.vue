<template>
  <div>
    <component :is="panelComps[panelName]" :key="currentPanel" />
    <diff-modal @register="registerDiff" />
    <preview-modal ref="previewRef" />
  </div>
</template>

<script lang="ts" setup>
  import { provide, computed, ref } from 'vue';
  import { currentPanel } from '/@page-designer/hooks/usePage';
  import panelComps from './index';
  import { useModal } from '/@/components/Modal';
  import diffModal from './page/modals/diff-modal.vue';
  import previewModal from './page/modals/preview-modal.vue';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const [registerDiff, { openModal: openDiffModal }] = useModal();

  const previewRef = ref();

  const { mitt } = useMitt();

  const stage = ref<'phone' | 'pad'>('phone');

  mitt.on('switch-stage', (type: any) => {
    stage.value = type;
  });

  const openPreview = (option) => {
    previewRef.value.openPreview({ ...option, stage: stage.value });
  };

  provide('openDiffModal', openDiffModal);

  provide('openPreview', openPreview);

  const panelName = computed(() => {
    return 'panel-' + currentPanel.value;
  });
</script>

<style lang="less" scoped>
  :deep(.ant-switch-small.ant-switch) {
    min-width: 24px;
    height: 14px;
    line-height: 14px;
    position: relative;
    top: -1px;
  }
  :deep(.ant-switch-small .ant-switch-handle) {
    width: 10px;
    height: 10px;
  }
  :deep(.ant-switch-handle) {
    top: 2px;
  }
  :deep(.ant-switch-small.ant-switch-checked .ant-switch-handle) {
    left: calc(100% - 12px);
  }
  :deep(.ant-input-suffix) {
    color: #999;
  }
  :deep(.ant-input) {
    font-size: 12px;
  }
</style>
