<template>
  <div>
    <designer-stage-header class="designer-stage-header" />
    <div class="designer-stage-content">
      <div class="designer-canvas" @mousewheel="onMouseScroll" ref="container">
        <stage-canvas ref="canvas" />
        <zoom-menu @zoomChange="zoomHandler" @zoomFit="zoomFit" :zoom="zoom" />
      </div>
      <designer-panel class="designer-panel" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import DesignerStageHeader from './stage-header.vue';
  import DesignerPanel from '../panels/panel.vue';
  import StageCanvas from './stage-canvas.vue';
  import ZoomMenu from '../components/zoom/ZoomMenu.vue';
  import { useDesigner } from '../hooks/useDesigner';
  import { loadLabelInfo } from '../hooks/usePage';
  import { ref } from 'vue';

  const { zoom, updateEditorZoom } = useDesigner();
  const canvas = ref();
  const container = ref();
  loadLabelInfo();
  const zoomFit = () => {
    const targetWidth = container.value.offsetWidth;
    const targetHeight = container.value.offsetHeight;
    const stageElem = canvas.value.$el;
    const originWidth = stageElem.offsetWidth;
    const originHeight = stageElem.offsetHeight;
    let ratio = 1;
    if (targetWidth / targetHeight > originWidth / originHeight) {
      ratio = targetHeight / originHeight;
    } else {
      ratio = targetWidth / originWidth;
    }
    zoomHandler(ratio);
  };
  const zoomHandler = (zoomValue) => {
    updateEditorZoom(zoomValue);
  };
  const onMouseScroll = (e) => {
    if (e.altKey) {
      if (e.deltaY > 0 && zoom.value > 0.3) {
        updateEditorZoom(Math.round((zoom.value - 0.1) * 10) / 10);
      } else if (e.deltaY < 0 && zoom.value < 3.0) {
        updateEditorZoom(Math.round((zoom.value + 0.1) * 10) / 10);
      } else return;
    }
  };
</script>

<style lang="less" scoped>
  .designer-stage-header {
    height: 48px;
    background: #fff;
  }

  .designer-stage-content {
    display: flex;
    height: calc(100% - 48px);
    padding-top: 10px;

    .designer-canvas {
      position: relative;
      flex: 1;
      width: 10px;
      // padding-right: 12px;
      // margin-right: 12px;
      overflow: auto;
    }

    .designer-panel {
      flex: none;
      width: 280px;
      overflow: auto;
      background: #fff;
    }
  }
</style>
