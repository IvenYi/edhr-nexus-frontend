<template>
  <FlowDiagram
    v-bind="{
      ...$props,
      actions: actions || actionsData,
      onNodeCreate: nodeCreated,
      onNodeClick,
    }"
  />
</template>

<script setup lang="ts">
  import FlowDiagram from '../../views/flow-diagram.vue';
  import { BpmnNodeTypeEnum } from './enums';
  import { useGctPaasBpmn } from './hooks/useGctBpmn';

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

  const { onNodeCreate } = useGctPaasBpmn();

  const actionsData = [
    {
      key: BpmnNodeTypeEnum.BpmnApproval,
      name: '审批节点',
      icon: 'iconfont:icon-shenpi1',
      color: '#3168ec',
      group: '任务节点',
    },
    {
      key: BpmnNodeTypeEnum.BpmnJs,
      name: '脚本节点',
      icon: 'iconfont:icon-jiaobenjiedian',
      color: '#1FB1EA',
      group: '任务节点',
    },
    {
      key: BpmnNodeTypeEnum.BpmnMessage,
      name: '消息通知',
      icon: 'iconfont:icon-xiaoxitongzhi',
      color: '#6931EC',
      group: '消息节点',
    },
    {
      key: BpmnNodeTypeEnum.BpmnExclusive,
      name: '条件分支',
      icon: 'iconfont:icon-fenzhi',
      color: '#088c49',
      group: '逻辑节点',
    },
    {
      key: BpmnNodeTypeEnum.BpmnParallel,
      name: '并行分支',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
      group: '逻辑节点',
    },
  ];

  function nodeCreated(node, parent?, flow?) {
    onNodeCreate(node, parent, flow);
    if (props.onNodeCreated && typeof props.onNodeCreated === 'function') {
      props.onNodeCreated(node, parent, flow);
    }
  }
</script>

<style lang="less">
  @import url(./styles/index.less);
</style>
