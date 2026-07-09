<template>
  <div class="overflow-auto p12px">
    <component
      :is="settingsModulesMap[type]"
      :node="node"
      :node-data="nodeData"
      :readonly="flowReadonly"
      @toggle-step="toggleStep"
    />
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, computed } from 'vue';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { PanelStep, EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useFlow } from '../../hooks/useFlow';
  import type { GctFlowNode } from '@gct/flow';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Base;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();

  const emit = defineEmits(['toggle-step']);
  const { flowReadonly } = useFlow();

  const settingModules: any = import.meta.glob('./setting-types/*.vue');

  const settingsModulesMap = Object.keys(settingModules).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map[name] = defineAsyncComponent(settingModules[path]);
    return map;
  }, {});

  const type = computed(() => {
    if (props.nodeData.bizData.endpointType === EndpointType.scheduleTrigger) {
      return props.nodeData.bizData.nodeConfig.quartzType.toLowerCase();
    }
    // else if (props.nodeData.type === IPaasNodeType.Condition && props.nodeData.bizData.endpointType === ) {
    //   return IPaasNodeType.Condition;
    // }
    return props.nodeData.bizData.endpointType;
  });

  const toggleStep = (step) => emit('toggle-step', step);
</script>

<style lang="less" scoped>
  :deep(.ant-form-vertical) {
    .ant-form-item {
      margin: 0;
      & + .ant-form-item {
        margin-top: 8px;
      }

      &.readonly-item {
        .ant-form-item-control-input {
          min-height: auto;
        }
      }
    }
    .ant-form-item-label {
      line-height: 22px;
      padding: 0;
      label {
        font-size: 12px;
        color: #797a7d;
      }
    }
    .ant-form-item-explain-error {
      font-size: 12px;
    }
  }

  :deep(.ant-collapse) {
    font-size: 12px;
    .ant-collapse-header {
      padding: 12px 0;
      color: #212528;
      .ant-collapse-arrow {
        margin: 0;
      }
    }
    .collapse-icon-down {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
      font-size: 16px !important;
    }

    .ant-collapse-item-active {
      .collapse-icon-down {
        transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
      }
    }
  }
  :deep(
    .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
  ) {
    padding: 0;
  }
  :deep(.ant-input-sm),
  :deep(.ant-select-sm),
  :deep(.ant-input-number-sm input) {
    font-size: 12px;
  }
</style>
