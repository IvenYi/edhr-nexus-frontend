<template>
  <div class="p-12px">
    <div class="step-panel__opts">
      <div
        class="step-panel__option"
        :class="{
          'step-panel__option--selected': nodeData.bizData.endpointType === item,
          'important-cursor-not-allowed': flowReadonly,
        }"
        v-for="item in options"
        :key="item"
        @click="handleClick(item)"
        >{{ item }}
        <i class="iconfont icon-xuanze"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { PanelStep, EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { NodeBizDataSchemaMap } from '/@ipaas/schemas/node-biz-data';
  import { useFlow } from '../../hooks/useFlow';

  const emit = defineEmits(['toggle-step']);

  const props = defineProps<{
    nodeData: NodeDataSchema.Trigger;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();

  const { addApiResponseNode, removeApiResponseNode, fuuid, createNodeBizData, flowReadonly } =
    useFlow();

  const options = ref<EndpointType[]>([EndpointType.webhook]);

  const handleClick = (type: EndpointType) => {
    if (flowReadonly.value) return;

    if (props.nodeData.bizData.endpointType !== type) {
      if (NodeBizDataSchemaMap[type]) {
        // 创建节点 bizData
        props.nodeData.bizData = createNodeBizData(type, props.nodeData?.bizData);
      }
      if (type === EndpointType.webhook) {
        props.nodeData.bizData.nodeConfig.path = '/' + fuuid.value;
        // webhook 自动添加 apiresponse 节点
        addApiResponseNode();
      } else {
        // 移除 apiresponse 节点
        removeApiResponseNode();
      }
    }

    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };
</script>

<style lang="less" scoped>
  @import './step-panel.less';
</style>
