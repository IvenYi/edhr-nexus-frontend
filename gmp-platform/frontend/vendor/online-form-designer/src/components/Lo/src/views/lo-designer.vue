<template>
  <div class="lo-designer" ref="LoDesignerRef">
    <lo-header class="header" />
    <div class="flex">
      <div class="dnd flex-none w-264px mr-12px bg-fff">
        <lo-dnd ref="DndRef" />
      </div>
      <div class="flex-1 w-1px bg-fff">
        <lo-graph ref="GraphRef" />
      </div>
      <div class="flex-none w-280px ml-12px bg-fff relative">
        <lo-panel class="panel" />
      </div>
    </div>
    <!-- <editor-console :defaultInput="'{\n    \n}'" /> -->
    <!-- <save-as-modal @register="registerSaveAs" /> -->
  </div>
</template>

<script lang="ts" setup name="js-editor">
  import { provide, onMounted, ref, unref } from 'vue';

  import LoHeader from './modules/lo-header.vue';
  // import LoToolbar from './modules/lo-toolbar.vue';
  import LoGraph from './modules/lo-graph.vue';
  import LoDnd from './modules/lo-dnd.vue';
  import LoPanel from './modules/lo-panel.vue';
  import { useControlsRegister } from '../hooks/useControlsRegister';
  import { useLo } from '../hooks/useLo';
  import { useGlobal } from '/@page-designer/hooks/useGlobal';

  const LoDesignerRef = ref();

  const { queryGVar } = useGlobal();
  queryGVar();

  const { registerControls } = useControlsRegister();
  registerControls();

  const { registerLoEditor } = useLo();
  onMounted(() => {
    registerLoEditor({
      graphContainer: LoDesignerRef.value.querySelector('.lo-graph'),
      dndContainer: LoDesignerRef.value.querySelector('.lo-dnd'),
    });
  });
</script>

<style lang="less" scoped>
  .lo-designer {
    height: 100%;
    width: 100%;
    color: #333;
    position: relative;

    --header-size: 56px;

    .bg-fff {
      background: #fff;
    }
    .header {
      height: var(--header-size);
      background: #f1f1f1;

      & + div {
        height: calc(100% - var(--header-size));
        background: #ebebeb;
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
  @import '../style/index.less';
</style>
