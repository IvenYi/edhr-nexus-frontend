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
  import { useGctIPaaSBpmn } from './hooks/useGctBpmn';

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

  const { onNodeCreate } = useGctIPaaSBpmn();

  const actionsData = [
    {
      key: BpmnNodeTypeEnum.BpmnConnector,
      name: '连接器',
      icon: 'iconpark:api-app',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnScript,
      name: '脚本节点',
      icon: 'iconfont:icon-JS',
      color: '#1FB1EA',
    },
    {
      key: BpmnNodeTypeEnum.BpmnExclusive,
      name: '条件分支',
      icon: 'iconfont:icon-fenzhi',
      color: '#088c49',
    },
    {
      key: BpmnNodeTypeEnum.BpmnParallel,
      name: '并行分支',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
    },
    {
      key: BpmnNodeTypeEnum.BpmnLoop,
      name: '循环节点',
      icon: 'iconfont:icon-xunhuan',
      color: '#4c26cf',
      hide: true,
    },
    {
      key: BpmnNodeTypeEnum.BpmnLoop,
      name: '终止循环',
      icon: 'iconfont:icon-jieshu',
      color: '#F54547',
      hide: ({ parent }) => !parent || parent.type !== BpmnNodeTypeEnum.BpmnLoop,
    },
    {
      key: BpmnNodeTypeEnum.BpmnLoop,
      name: '跳出循环',
      icon: 'iconfont:icon-xunhuan',
      color: '#4c26cf',
      hide: true,
    },
    // {
    // {
    //   key: FlowNodeTypeEnum.End,
    //   name: '结束',
    //   icon: 'iconfont:icon-jieshu',
    //   color: '#3168ec',
    // },
  ];

  function nodeCreated(node) {
    onNodeCreate(node);
    if (props.onNodeCreated && typeof props.onNodeCreated === 'function') {
      props.onNodeCreated(node);
    }
  }
</script>

<style lang="less">
  @import url(./styles/index.less);
</style>
