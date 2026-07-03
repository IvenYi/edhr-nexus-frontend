<template>
  <div class="p-12px">
    <div class="step-panel__opts">
      <div
        class="step-panel__option"
        :class="{
          'step-panel__option--selected': nodeData.triggerType === item,
          'important-cursor-not-allowed': flowReadonly,
        }"
        v-for="item in TriggerType"
        :key="item"
        @click="handleClick(item)"
        >{{ t('sys.ipaas.stepTrigger.' + item) }}
        <i class="iconfont icon-xuanze"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { TriggerType, PanelStep } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useFlow } from '../../hooks/useFlow';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    nodeData: NodeDataSchema.Trigger;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();
  const emit = defineEmits(['toggle-step']);

  const { removeApiResponseNode, flowReadonly } = useFlow();
  const { t } = useI18n();

  const handleClick = (type: TriggerType) => {
    if (flowReadonly.value) return;
    if (type !== TriggerType.Fixed) {
      // 移除 apiresponse 节点
      removeApiResponseNode();
    }
    // const index = props.nodeSteps.findIndex((s) => s === props.node.step);
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.triggerType = type;
    // 清空业务数据
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.bizData.endpointType = undefined;
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.step = type === TriggerType.Fixed ? PanelStep.Access : PanelStep.Timer;
    emit('toggle-step', props.nodeData.step);

    // if (index < props.nodeSteps.length - 1) {
    //   const step = props.node.steps[index + 1];
    //   props.node.step = step;
    // }
  };
</script>

<style lang="less" scoped>
  @import './step-panel.less';
</style>
