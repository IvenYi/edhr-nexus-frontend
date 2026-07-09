<template>
  <div class="gct-flow__wrapper" :id="node.id">
    <div class="gct-flow__wrapper--before"> </div>
    <div
      class="gct-flow__wrapper--content"
      :class="{
        readonly: isReadonly,
      }"
    >
      <slot></slot>
    </div>

    <!-- 节点属性allNext表示允许后续节点 -->
    <!-- 节点类型End表示结束节点 -->
    <div
      v-if="renderEntryAfter"
      class="gf__line--with-actions"
      :class="{
        'line--dashed': node?.type === FlowNodeTypeEnum.End,
        'inst-finished': nodeInstFinished,
      }"
    >
      <template v-if="!isReadonly">
        <LineActions v-bind="$props">
          <div v-if="node.id === gctFlowData?.children.slice(-1)[0].id" class="new-step">{{
            $t('sys.ipaas.addNewStep')
          }}</div>
        </LineActions>
      </template>
      <!-- 当前链路最后一个节点才需要箭头 -->
      <LineArrow v-if="node.id !== list.filter((e) => !e.hidden).slice(-1)[0].id" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { FlowNodeTypeEnum } from '../enums';
  import type { GctFlowNode } from '../types';
  import { useGctFlow } from '../hooks/useGctFlow';
  import LineActions from '../comps/LineActions.vue';
  import LineArrow from '../comps/LineArrow.vue';
  import { isFinished } from '../utils/svg-def';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    prev?: GctFlowNode.Basic;
    next?: GctFlowNode.Basic;
    list: GctFlowNode.Basic[];
    flow: GctFlowNode.Flow;
    parent?: GctFlowNode.Basic;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { isReadonly, gctFlowData, gctFlowDataLastNode, nodeInstStatusMap, gctFlowDataMap } =
    useGctFlow(uniqueFlowKey);

  const renderEntryAfter = computed(() => {
    // 不允许后续节点
    if (props.node.allowNext === false) return false;
    // 只读 && 最后一个节点
    if (isReadonly.value && props.node.id === gctFlowDataLastNode.value?.id) return false;
    return true;
  });

  const nodeInstFinished = computed(() => {
    return isFinished(props.node, nodeInstStatusMap.value);
  });
</script>

<style lang="less" scoped>
  .new-step {
    position: absolute;
    bottom: -50px;
    min-width: 120px;
    padding: 13px 20px;
    border: 1px dashed #e8ebf0;
    border-radius: 4px;
    background-color: #fff;
    color: var(--ant-primary-color);
    cursor: pointer;
  }

  polyline {
    stroke-width: 2;
    stroke: black;
    fill: none;
    stroke-linejoin: round; /* 设置线条连接为圆角 */
  }
</style>
