<template>
  <div>
    <!-- {{ nodeData }} -->
    <template v-if="activeStep === '1'">
      <ConnectorTypeOpts
        :value="nodeData.connector"
        :disabled="flowReadonly"
        :isApp="!!appInfo.appTag"
        @change="(value) => handleConnectorTypeClick(value)"
      />
    </template>

    <template v-if="activeStep === '2'">
      <ConnectorAppOpts
        :value="nodeData.bizData.nodeConfig?.authId"
        @change="(value) => handleConnectorAppClick(value)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { PanelStep, EndpointType, ConnectorType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import type { AppConnectorResp } from '/@/apis/gct-ipaas2/model';
  import { useFlow } from '../../hooks/useFlow';
  import ConnectorTypeOpts from './__comps__/connector-type-opts.vue';
  import ConnectorAppOpts from './__comps__/connector-app-opts.vue';
  import { GctFlowNode } from '@gct/flow';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();
  const emit = defineEmits(['toggle-step']);

  const activeStep = ref<'1' | '2'>('1');
  const { createNodeBizData, flowReadonly, appInfo } = useFlow();

  /**
   * 连接器类型变化
   */
  const handleConnectorTypeClick = (item: ConnectorType) => {
    if (flowReadonly.value) return;
    if (props.nodeData.connector === item) {
      switch (item) {
        case ConnectorType.Http:
        case ConnectorType.Script:
          emit('toggle-step', PanelStep.Setting);
          break;
        case ConnectorType.App:
          // activeStep.value = '2';
          emit('toggle-step', PanelStep.Apps);
          break;
        default:
          emit('toggle-step', PanelStep.Setting);
      }
    } else {
      // eslint-disable-next-line vue/no-mutating-props
      props.node.tooltips = [];
      // eslint-disable-next-line vue/no-mutating-props
      switch (item) {
        case ConnectorType.Http:
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.bizData = createNodeBizData(
            EndpointType.baseHttp,
            props.nodeData?.bizData,
          );
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.step = PanelStep.Setting;
          emit('toggle-step', props.nodeData.step);
          break;
        case ConnectorType.Script:
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.bizData = createNodeBizData(EndpointType.script, props.nodeData?.bizData);
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.step = PanelStep.Setting;
          emit('toggle-step', props.nodeData.step);
          break;
        case ConnectorType.App:
          // activeStep.value = '2';
          if (props.nodeData.bizData.endpointType) {
            // eslint-disable-next-line vue/no-mutating-props
            props.nodeData.bizData.endpointType = undefined;
          }
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.step = PanelStep.Apps;
          emit('toggle-step', PanelStep.Apps);
          break;
        case ConnectorType.Db:
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.bizData = createNodeBizData(EndpointType.db, props.nodeData?.bizData);
          // eslint-disable-next-line vue/no-mutating-props
          props.nodeData.step = PanelStep.Setting;
          emit('toggle-step', props.nodeData.step);
          break;
        default:
          emit('toggle-step', PanelStep.Setting);
      }
    }
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.connector = item;
  };

  // const handleClick = (type: EndpointType) => {
  //   if (flowReadonly.value) return;

  //   if (props.nodeData.bizData.nodeConfig.authId) {
  //     if (NodeBizDataSchemaMap[type]) {
  //       props.nodeData.bizData = createNodeBizData(type);
  //     }
  //     props.nodeData.bizData.nodeConfig.authId = '';
  //   }
  //   props.nodeData.bizData = createNodeBizData(EndpointType.baseHttp);
  //   props.nodeData.step = PanelStep.Setting;
  //   emit('toggle-step', props.nodeData.step);
  // };

  /**
   * 连接器 - 应用 变化
   */
  const handleConnectorAppClick = (item: AppConnectorResp) => {
    if (props.nodeData.bizData.nodeConfig.authId !== item.id) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData = createNodeBizData(
        EndpointType.apiConnector,
        props.nodeData?.bizData,
      );
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig.authId = item.id;
    }
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };
</script>

<style lang="less" scoped>
  @import './step-panel.less';
</style>
