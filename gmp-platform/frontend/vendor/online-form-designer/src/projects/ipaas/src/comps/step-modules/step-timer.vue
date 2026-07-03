<template>
  <div class="p-12px">
    <div class="step-panel__opts">
      <div
        class="step-panel__option"
        :class="{
          'step-panel__option--selected': nodeData.bizData.nodeConfig?.quartzType === item,
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
  import { PanelStep, EndpointType, QuartzType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { NodeBizDataSchemaMap } from '/@ipaas/schemas/node-biz-data';
  import { useFlow } from '../../hooks/useFlow';

  const emit = defineEmits(['toggle-step']);

  const props = defineProps<{
    nodeData: NodeDataSchema.Trigger;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();

  const { createNodeBizData, flowReadonly } = useFlow();

  const options = ref<QuartzType[]>([QuartzType.CRON]);

  const handleClick = (type: QuartzType) => {
    if (flowReadonly.value) return;

    if (props.nodeData.bizData.nodeConfig?.quartzType !== type) {
      const _type = type.toLocaleLowerCase();
      if (NodeBizDataSchemaMap[_type]) {
        // 创建节点 bizData
        props.nodeData.bizData = createNodeBizData(_type, props.nodeData?.bizData);
      }
    }

    props.nodeData.bizData.endpointType = EndpointType.scheduleTrigger;

    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };
</script>

<style lang="less" scoped>
  @import './step-panel.less';
</style>
