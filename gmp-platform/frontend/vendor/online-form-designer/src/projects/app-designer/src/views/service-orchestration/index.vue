<template>
  <div class="service-orchestration" ref="SOContainerRef">
    <so-header class="header" />
    <div class="flex">
      <div class="dnd flex-none w-264px mr-12px bg-fff">
        <so-dnd ref="DndRef" />
      </div>
      <div class="flex-1 w-200px">
        <so-toolbar class="toolbar" />
        <div class="flex">
          <div class="flex-1 w-200px bg-fff">
            <so-graph ref="GraphRef" />
          </div>
          <div class="flex-none w-280px ml-12px bg-fff relative">
            <so-panel class="panel" />
          </div>
        </div>
      </div>
    </div>
    <editor-console :defaultInput="'{\n    \n}'" />
    <save-as-modal @register="registerSaveAs" />
  </div>
</template>

<script lang="ts" setup name="js-editor">
  import { provide, onMounted, ref, unref } from 'vue';

  import SoHeader from './modules/so-header.vue';
  import SoToolbar from './modules/so-toolbar.vue';
  import SoGraph from './modules/so-graph.vue';
  import SoDnd from './modules/so-dnd.vue';
  import SoPanel from './modules/so-panel.vue';
  import saveAsModal from './modules/modals/save-as-modal.vue';
  import EditorConsole from '/@/components/code-editor/editor-console.vue';
  import { useNodeRegister } from './hooks/useNodeRegister';
  import { useModal } from '/@/components/Modal';

  import { useSO } from './hooks/useSO';

  const SOInstance = useSO();
  provide('SOInstance', SOInstance);

  const { registerNodes } = useNodeRegister();
  registerNodes();

  const [registerSaveAs, { openModal: openSaveAsModal }] = useModal();
  provide('openSaveAsModal', openSaveAsModal);

  const SOContainerRef = ref();

  SOInstance.load();

  onMounted(() => {
    SOInstance.init({
      graphContainer: SOContainerRef.value.querySelector('.so-graph'),
      dndContainer: SOContainerRef.value.querySelector('.o-dnd'),
    });
  });
</script>

<style lang="less" scoped>
  .service-orchestration {
    background: #f1f1f1;
    height: 100vh;
    width: 100vw;
    color: #333;
    position: relative;
    overflow: hidden;
    .bg-fff {
      background: #fff;
    }
    .header {
      height: 56px;

      & + div {
        height: calc(100% - 56px - 50px);
      }
    }

    .dnd {
      background: #fff;
    }

    .toolbar {
      height: 48px;
      background: #fff;

      & + div {
        margin-top: 10px;
        height: calc(100% - 48px - 10px);
      }
    }
  }
</style>

<style lang="less">
  @import './style/index.less';
</style>
