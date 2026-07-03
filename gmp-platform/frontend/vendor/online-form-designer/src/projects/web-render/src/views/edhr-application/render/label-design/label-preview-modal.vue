<template>
  <div class="gct-label-preview-modal flex">
    <DesignerStage :readonly="true" :id="id" class="flex-1" />
  </div>
</template>
<script setup lang="ts">
  import DesignerStage from '/@app-designer/views/print-designer-new/label-design/stage/stage.vue';
  import { useModal, IModal } from '@gct/runtime';

  defineProps<{
    modal: IModal;
    id: string;
  }>();
</script>
<style lang="less" scoped>
  .gct-label-preview-modal {
    height: calc(100vh - 55px);
  }
</style>
