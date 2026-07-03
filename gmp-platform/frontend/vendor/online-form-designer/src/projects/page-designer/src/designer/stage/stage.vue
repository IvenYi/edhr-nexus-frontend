<template>
  <div class="relative overflow-hidden">
    <designer-stage-header class="designer-stage-header" />
    <div class="designer-stage-content" :key="modalInfo.id">
      <designer-canvas v-if="platform === Platform.WEB" class="designer-canvas" />
      <designer-mobile-canvas v-else-if="platform === Platform.MOBILE" />
      <designer-pad-canvas v-else-if="platform === Platform.PAD" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import DesignerStageHeader from './stage-header.vue';
  import DesignerCanvas from '../stage/stage-canvas.vue';
  import DesignerMobileCanvas from './stage-mobile-canvas.vue';
  import DesignerPadCanvas from './stage-pad-canvas.vue';
  import { Platform } from '/@page-designer/enum';
  import { platform } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { modalInfo } = useDesigner();
</script>

<style lang="less" scoped>
  .designer-stage-header {
    height: 42px;
    padding-right: 12px;
    padding-left: 12px;
    border-bottom: 1px solid @gct-modal-border-color;
    background: #fff;
  }

  .designer-stage-content {
    position: absolute;
    z-index: 0;
    inset: 0;
    top: 42px;
    display: flex;

    .designer-canvas {
      flex: 1;
      width: 10px;
    }
  }
</style>
