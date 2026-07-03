<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />

    <div
      class="gct-bpmn__message"
      :class="{
        selected: nodeSelectedId === node.id,
      }"
    >
      <div>
        <i class="iconfont icon-liuchengbiaodan lh-[1em]"></i>
      </div>
      <div :title="i18nTitle" class="flex-1 ell">
        {{ $t(getI18nName(node.data)) || node.data?.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import { useGctPaasBpmn } from '../hooks/useGctBpmn';

  const props = defineProps<{
    node: GctBpmnNode.BpmnForm;
  }>();

  const i18nTitle = computed(() => $t(getI18nName(props?.node.data)) || props?.node.data?.name);

  const { onNodeClick, nodeSelectedId } = useGctFlow();
  const { getI18nName } = useGctPaasBpmn();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__message {
      --color: #3168ec;
      border: 1px solid #e8ebf0;
      background-color: #fff;
      height: 46px;
      width: 120px;
      border-radius: 4px;
      display: flex;
      padding: 0 16px;
      align-items: center;
      justify-content: center;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      & > div:first-child {
        height: 20px;
        width: 20px;
        border-radius: 4px;
        margin-right: 8px;
        color: var(--color);
        background-color: rgba(from var(--color) r g b / 10%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
