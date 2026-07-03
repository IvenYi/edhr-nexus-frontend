<template>
  <FlowDiagram
    v-bind="{
      ...$props,
      actions: actions || actionsData,
      onNodeCreate: nodeCreated,
      onNodeClick,
      flowKey: 'bizBpmn',
    }"
  />
</template>

<script setup lang="ts">
  import { onBeforeUnmount, provide } from 'vue';
  import FlowDiagram from '../../views/flow-diagram.vue';
  import { BpmnNodeTypeEnum } from './enums';
  import { useGctBizBpmn } from './hooks/useGctBpmn';

  const props = defineProps<{
    onNodeClick?: any;
    onNodeCreated?: Function;
    actions?: Array<{
      key: string;
      name: string;
      icon: string;
      color: string;
    }>;
  }>();

  provide('bizFlowKey', 'bizBpmn');
  const { onNodeCreate, reset } = useGctBizBpmn();

  const actionsData = [
    {
      key: BpmnNodeTypeEnum.BpmnBizDocument,
      name: '表单节点',
      icon: 'iconfont:icon-xiaoxitongzhi',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnExclusive,
      name: '条件分支',
      icon: 'iconfont:icon-fenzhi',
      color: '#088c49',
    },
    {
      key: BpmnNodeTypeEnum.BpmnParallel,
      name: '条件并行',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
    },
    {
      key: BpmnNodeTypeEnum.BpmnTransaction,
      name: '事务节点',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#0d70af',
    },
    // {
    //   key: BpmnNodeTypeEnum.BpmnParallel,
    //   name: '连接节点',
    //   icon: 'iconfont:icon-binghangfenzhi',
    //   color: '#FF980E',
    // },
    {
      key: BpmnNodeTypeEnum.BpmnAllocat,
      name: '配置节点',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
    },
  ];

  function nodeCreated(node, parent?, flow?) {
    onNodeCreate(node, parent, flow);
    if (props.onNodeCreated && typeof props.onNodeCreated === 'function') {
      props.onNodeCreated(node, parent, flow);
    }
  }

  onBeforeUnmount(() => {
    reset();
  });
</script>

<style lang="less">
  @import url(./styles/index.less);
</style>
