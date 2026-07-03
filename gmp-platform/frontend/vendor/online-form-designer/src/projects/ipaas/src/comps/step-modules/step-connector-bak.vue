<template>
  <div class="p-12px">
    <div class="text-12px">{{ $t('sys.ipaas.appConnector') }}</div>
    <div class="step-panel__opts mt-10px">
      <div
        class="step-panel__option"
        :class="{
          'step-panel__option--selected': nodeData.bizData.nodeConfig?.authId === item.id,
        }"
        v-for="item in appConnectors"
        :key="item.id"
        @click="handleConnectorClick(item)"
        >{{ item.appName }}
        <i class="iconfont icon-xuanze"></i>
      </div>
    </div>

    <div class="text-12px mt-20px">{{ $t('sys.ipaas.generalConnector') }}</div>
    <div class="step-panel__opts mt-10px">
      <div
        class="step-panel__option"
        :class="{
          'step-panel__option--selected':
            !nodeData.bizData.nodeConfig?.authId && nodeData.bizData.endpointType === item,
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
  import { ref, onMounted } from 'vue';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { PanelStep, EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { NodeBizDataSchemaMap } from '/@ipaas/schemas/node-biz-data';
  import { getConnectorConfigList } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import type { AppConnectorResp } from '/@/apis/gct-ipaas2/model';
  import { useFlow } from '../../hooks/useFlow';

  const emit = defineEmits(['toggle-step']);

  const props = defineProps<{
    nodeData: NodeDataSchema.Trigger;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();

  const { createNodeBizData, flowReadonly } = useFlow();

  const options = ref<EndpointType[]>([EndpointType.baseHttp]);
  const appConnectors = ref<AppConnectorResp[]>([]);

  const getAppConnectors = () => {
    getConnectorConfigList().then((res) => {
      appConnectors.value = res ?? [];
    });
  };

  onMounted(() => {
    getAppConnectors();
  });

  const handleClick = (type: EndpointType) => {
    if (flowReadonly.value) return;

    if (props.nodeData.bizData.nodeConfig.authId) {
      if (NodeBizDataSchemaMap[type]) {
        props.nodeData.bizData = createNodeBizData(type, props.nodeData?.bizData);
      }
      props.nodeData.bizData.nodeConfig.authId = '';
    }
    props.nodeData.bizData = createNodeBizData(EndpointType.baseHttp, props.nodeData?.bizData);
    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };

  const handleConnectorClick = (item: AppConnectorResp) => {
    if (props.nodeData.bizData.nodeConfig.authId !== item.id) {
      props.nodeData.bizData.nodeConfig.authId = item.id;
    }
    props.nodeData.bizData = createNodeBizData(EndpointType.baseHttp, props.nodeData?.bizData);
    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };
</script>

<style lang="less" scoped>
  @import './step-panel.less';
</style>
