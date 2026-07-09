<template>
  <div class="bpmn-designer-grid" ref="BpmnDesignerRef">
    <div class="grid-canvas">
      <bpmn-graph ref="GraphRef" />
    </div>
    <bpmn-header class="grid-header" />
    <bpmn-pattern class="grid-dnd" />
    <bpmn-toolbar class="grid-toolbar" />
    <div class="grid-panel">
      <bpmn-panel />
    </div>
    <save-as-modal @register="registerSaveAs" />
    <service-modal @register="registerService" />
  </div>
</template>

<script lang="ts" setup name="js-editor">
  import { provide, onMounted, ref } from 'vue';

  import BpmnHeader from './src/views/modules/bpmn-header.vue';
  import BpmnToolbar from './src/views/modules/bpmn-toolbar.vue';
  import BpmnGraph from './src/views/modules/bpmn-graph.vue';
  import BpmnPattern from './src/views/modules/bpmn-pattern.vue';
  import BpmnPanel from './src/views/modules/bpmn-panel.vue';
  import { useBpmn } from './src/hooks/useBpmn';
  import SaveAsModal from './src/views/modals/save-as-modal.vue';
  import { useModal } from '/@/components/Modal';
  import ServiceModal from './src/views/modals/service-modal.vue';

  const BpmnDesignerRef = ref();

  const [registerSaveAs, { openModal: openSaveAsModal }] = useModal();
  provide('openSaveAsModal', openSaveAsModal);
  const [registerService, { openModal: openServiceModal }] = useModal();
  provide('openServiceModal', openServiceModal);

  const { initialize, loadProcess } = useBpmn();
  loadProcess();
  onMounted(() => {
    initialize({
      container: BpmnDesignerRef.value.querySelector('.lo-graph'),
    });
  });
</script>

<style lang="less">
  @import './src/style/index.less';
</style>

<style lang="less" scoped>
  .bpmn-designer-grid {
    height: 100%;
    width: 100%;
    color: #333;
    display: grid;
    grid-template-areas:
      'header header header'
      'dnd toolbar toolbar'
      'dnd canvas panel';
    grid-template-columns: 264px 1fr 264px;
    grid-template-rows: 56px 48px minmax(0, 1fr);
    background: #f1f1f1;

    .grid-header {
      grid-area: header;
    }
    .grid-dnd {
      grid-area: dnd;
      background-color: #fff;
    }
    .grid-toolbar {
      grid-area: toolbar;
      background-color: #fff;
    }
    .grid-canvas {
      grid-area: canvas;
      overflow: hidden;
      padding: 12px 12px 0;
      & > div {
        background: #fff;
      }
    }
    .grid-panel {
      grid-area: panel;
      padding-top: 12px;

      & > div {
        background: #fff;
      }
    }
  }
</style>
