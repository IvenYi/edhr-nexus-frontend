<template>
  <FlowDiagram
    v-bind="{
      ...$props,
      actions: actions || actionsData,
      onNodeCreate,
    }"
  />
</template>

<script setup lang="ts">
  import FlowDiagram from '../../views/flow-diagram.vue';
  import { BpmnNodeTypeEnum } from './enums';
  import { useGctBpmn } from './hooks/useGctBpmn';

  defineProps<{
    actions?: Array<{
      key: string;
      name: string;
      icon: string;
      color: string;
    }>;
  }>();

  const { onNodeCreate } = useGctBpmn();

  const actionsData = [
    {
      key: BpmnNodeTypeEnum.BpmnApproval,
      name: '审批节点',
      icon: 'iconfont:icon-shenpi1',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnExclusive,
      name: '条件分支',
      icon: 'iconfont:icon-fenzhi',
      color: '#088c49',
    },
    {
      key: BpmnNodeTypeEnum.BpmnJudge,
      name: '判断节点',
      icon: 'iconfont:icon-panduan',
      color: '#0D70AF',
    },
    {
      key: BpmnNodeTypeEnum.BpmnParallel,
      name: '并行节点',
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
    },
    {
      key: BpmnNodeTypeEnum.BpmnMessage,
      name: '消息通知',
      icon: 'iconfont:icon-xiaoxitongzhi',
      color: '#6931ec',
    },
  ];
</script>

<style lang="less">
  @import url(./styles/index.less);
</style>
