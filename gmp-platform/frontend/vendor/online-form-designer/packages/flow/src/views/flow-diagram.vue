<template>
  <div
    ref="GctFlowRef"
    class="gct-flow"
    :class="{
      'gct-flow--grabbing': isGrabbing,
    }"
  >
    <div
      class="gct-flow--transform"
      :style="{
        '--scale': `scale(${displayScale / 100})`,
      }"
    >
      <NodeFlow v-if="gctFlowData" :flow="gctFlowData" />
    </div>
    <GraphTools />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, provide } from 'vue';
  import NodeFlow from '../nodes/NodeFlow.vue';
  import GraphTools from '../comps/GraphTools.vue';
  import { useGctFlow } from '../hooks/useGctFlow';
  import { useGrab } from '../hooks/useGrab';
  import type { GctFlowNode } from '../types/index.d.ts';

  interface IGctFlowOptions {
    data?: GctFlowNode.Flow;
    readonly?: boolean;
    instMode?: boolean;
    onNodeCreate?: any;
    onNodeClick?: any;
    flowKey?: string;
    actions?: Array<{
      key: string;
      name: string;
      icon: string;
      color: string;
    }>;
  }
  const { grabListener, isGrabbing } = useGrab();

  const props = withDefaults(defineProps<IGctFlowOptions>(), {
    readonly: false,
    instMode: false,
    flowKey: 'commonFlow',
  });

  provide('uniqueFlowKey', props.flowKey);
  const { init, displayScale, gctFlowData } = useGctFlow(props.flowKey || 'commonFlow');
  const GctFlowRef = ref();

  onMounted(() => {
    init({
      ...props,
    });
    grabListener(GctFlowRef.value);
  });
</script>

<style lang="less">
  @import url(../styles/index.less);
</style>
