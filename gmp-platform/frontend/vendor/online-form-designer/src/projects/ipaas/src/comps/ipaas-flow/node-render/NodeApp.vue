<template>
  <div class="gct-flow__node gct-flow__node--app flex items-center">
    <div class="gct-flow__node-icon">
      <icon-park type="api-app" />
    </div>
    <div class="gct-flow__node-content">
      <div class="overflow-hidden">
        <!-- 触发器 -->
        <template v-if="isTrigger">
          <div>
            <span>N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
            <span v-if="nodeData?.bizData.endpointType === EndpointType.webhook">Webhook</span>
            <span v-else-if="nodeData?.bizData.nodeConfig?.quartzType === QuartzType.CRON"
              >Cron</span
            >
            <span v-else>--</span>
          </div>
          <div class="text-[#C3C3C3] ell mt-4px">
            <template v-if="nodeData.triggerType === TriggerType.Fixed">{{
              $t('sys.ipaas.fixedTrigger')
            }}</template>
            <template v-else-if="nodeData.triggerType === TriggerType.Timed">{{
              $t('sys.ipaas.timedTrigger')
            }}</template>
            <template v-else>{{ $t('sys.ipaas.pleaseSelectTrigger') }}</template>
          </div>
        </template>

        <!-- 连接器 -->
        <template v-else-if="isConnector">
          <div>
            <span>N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
            <span v-if="nodeData.connector === ConnectorType.Http">BaseHttp</span>
            <span v-else-if="nodeData.connector === ConnectorType.Script">{{$t('sys.scripts')}}</span>
            <span v-else-if="nodeData?.bizData.nodeConfig?.authId">{{$t('sys.app.index')}}</span>
            <span v-else>--</span>
          </div>
          <div class="text-[#C3C3C3] ell mt-4px">
            <template v-if="nodeData.connector === ConnectorType.App">{{ $t('sys.ipaas.appConnector') }}</template>
            <template v-else-if="nodeData.connector === ConnectorType.Http">{{
              $t('sys.ipaas.httpConnector')
            }}</template>
            <template v-else-if="nodeData.connector === ConnectorType.Script">{{
              $t('sys.ipaas.scriptConnector')
            }}</template>
            <template v-else>{{ $t('sys.ipaas.pleaseSelectConnector') }}</template>
          </div>
        </template>

        <!-- ApiResponse -->
        <template v-else-if="isApiResponse">
          <div>
            <span>N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
            <span>ApiResponse</span>
          </div>
        </template>

        <!-- others -->
        <template v-else>
          <div>
            <span>N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
            <span>--</span>
          </div>
          <!-- <div class="text-[#C3C3C3] gct-text-overflow">
        {{ '请选择连接器' }}
        <template v-if="!node?.data?.service">{{ '请选择动作' }}</template>
        <template v-else-if="!!node?.data?.service && !selectedCase.title">
          {{ '请选择触发操作' }}
        </template>
        <div class="text-[#212528] gct-text-overflow font-500">
          {{ selectedCase.title }}
        </div>
      </div> -->
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import type { GctFlowNode } from '@gct/flow';
  import { NodeDataSchemaMap } from '/@ipaas/schemas/node-data';
  import {
    IPaasNodeType,
    TriggerType,
    EndpointType,
    QuartzType,
    ConnectorType,
  } from '/@ipaas/enums';
  import { NodeDataSchema } from '/@ipaas/types';
  import { IconPark } from '@icon-park/vue-next/es/all';

  const props = defineProps<{
    node: GctFlowNode.App;
  }>();
  const { gctFlowDataMap } = useGctFlow();

  /**
   * 节点上挂载的数据
   */
  const nodeData = computed<NodeDataSchema.Base | undefined>(() => {
    return props.node.data;
  });

  /**
   * 触发器
   */
  const isTrigger = computed<boolean>(() => {
    return nodeData.value?.type === IPaasNodeType.Trigger;
  });

  /**
   * 连接器
   */
  const isConnector = computed<boolean>(() => {
    return nodeData.value?.type === IPaasNodeType.Connector;
  });

  /**
   * apiresponse
   */
  const isApiResponse = computed<boolean>(() => {
    return nodeData.value?.type === IPaasNodeType.ApiResponse;
  });

  const selectedCase = computed(() => {
    const type = props.node?.type;
    const service = props.node?.data?.service;
    if (type && service) {
      const cases = NodeDataSchemaMap[type].config.cases[service] ?? [];
      return cases.filter((e) => e.key === props.node?.data.case)[0] || {};
    } else {
      return {};
    }
  });
</script>

<style></style>
