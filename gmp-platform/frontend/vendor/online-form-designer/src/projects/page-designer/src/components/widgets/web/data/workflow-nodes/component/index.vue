<template>
  <div :class="[prefixCls, isFullScreen ? `${prefixCls}__full` : '']" ref="WorkflowRef">
    <wf-header
      :class="`${prefixCls}__header`"
      :toggle="toggleFullScreen"
      :is-full-screen="isFullScreen"
    />
    <div :class="`${prefixCls}__body`">
      <wf-split v-if="!props.readonly" v-model="splitValue" @on-move-end="onMoveEnd">
        <template #left>
          <wf-canvas :readonly="props.readonly" />
        </template>
        <template #right>
          <wf-panel :design-mode="designMode" :class="`${prefixCls}__tabs`" />
        </template>
      </wf-split>
      <wf-canvas v-else :readonly="props.readonly" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, provide, nextTick, onBeforeUnmount } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useWorkflow } from './hooks/useWorkflow';
  import { useRegister } from './hooks/useRegister';
  import { useEvent } from './hooks/useEvent';
  import WfCanvas from './modules/canvas.vue';
  import WfHeader from './modules/header.vue';
  import WfPanel from './modules/panel/index.vue';
  import WfSplit from './modules/split.vue';
  import { IEmitEventData } from './types';

  interface IWidgetProps {
    widgetId: string;
    modelKey: string;
    readonly?: boolean;
    designMode?: boolean;
  }

  const Event = getPageEvent();

  const props = defineProps<IWidgetProps>();
  provide('workflowProps', props);
  const emit = defineEmits(['event', 'setting']);
  const WorkflowRef = ref<HTMLElement | null>(null);

  const isFullScreen = ref<boolean>(false);
  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
  };

  const splitValue = ref(0.8);

  const { register } = useRegister();
  register();
  const { setEmitEvent, setSettingCallback } = useEvent(Event);
  setEmitEvent((data: IEmitEventData) => {
    if (typeof data.data === 'function') {
      emit('event', {
        ...data,
        data: data.data(),
      });
    } else {
      emit('event', data);
    }
  });
  setSettingCallback((data) => {
    emit('setting', data);
  });
  const {
    initWorkflow,
    initGraph,
    destroyGraph,
    getJson,
    setJson,
    getNodeNames,
    setNodeName,
    setNodeData,
    setNodeStatus,
    setNodeHighlight,
    setNodesHightLight,
    restNodesHighlight,
    resetMiniMap,
    workflowData,
  } = useWorkflow(props.widgetId, Event);
  const prefixCls = 'workflow-nodes';

  onMounted(async () => {
    await nextTick();
    console.log('initWorkflow');
    initWorkflow({
      containerEl: WorkflowRef.value!,
      designMode: props.designMode,
    });
  });

  onBeforeUnmount(() => {
    console.log('destroyGraph');
    destroyGraph();
  });

  const onRestMiniMap = () => {
    // 重新渲染小地图
    resetMiniMap({ containerEl: WorkflowRef.value! });
  };

  defineExpose({
    initGraph,
    destroyGraph,
    getJson,
    setJson,
    getNodeNames,
    setNodeName,
    setNodeData,
    setNodeStatus,
    setNodeHighlight,
    setNodesHightLight,
    restNodesHighlight,
    resetMiniMap: onRestMiniMap,
    workflowData,
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'workflow-nodes';

  .@{prefix-cls} {
    height: 434px;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    &__full {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 3000;
    }

    &__header {
      margin-bottom: 10px;
      flex: none;
    }

    &__body {
      flex: 1;
      height: 100px;
      width: 100%;
      display: flex;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      overflow: hidden;
    }

    &__tabs {
      border-left: 1px solid #eaeaea;
      width: 100%;
      height: 100%;
    }
  }
</style>

<style lang="less">
  @prefix-cls: ~'workflow-nodes';

  .@{prefix-cls} {
    .x6-edge-selected {
      filter: drop-shadow(2px 2px 0px #666);
    }
    .x6-node-selected {
      rect:first-child,
      image {
        filter: drop-shadow(2px 2px 0px #666);
      }
    }
    .x6-node {
      tspan,
      .workflow-nodes__name {
        cursor: pointer !important;
      }
    }
  }

  .workflow-nodes__name--tooltip {
    position: fixed;
    z-index: 99999;
    max-width: 320px;
    word-break: break-word;
    border-radius: 4px;
    color: #fff;
    padding: 8px;
    background: rgba(0, 0, 0, 0.8);
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -8px;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-top: 8px solid rgba(0, 0, 0, 0.8);
      border-right: 8px solid transparent;
      border-left: 8px solid transparent;
    }
  }
</style>
