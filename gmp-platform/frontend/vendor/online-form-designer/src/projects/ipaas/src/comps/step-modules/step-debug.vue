<template>
  <div class="my12px px12px h100% overflow-auto">
    <IfCase
      v-if="flowSelectedId && debugNodeMap[flowSelectedId]?.endpointType === EndpointType.if"
      :caseId="flowSelectedId"
    />
    <template v-else>
      <a-form ref="formRef" :model="debugNode" autocomplete="off" layout="vertical">
        <a-form-item :label="$t('sys.ipaas.requestResult')">
          <span class="log-status" :class="'log-status--' + debugNode.status">
            {{ $t('sys.ipaas.flowCallLogStatus.' + debugNode.status) }}
          </span>
        </a-form-item>
        <a-form-item :label="$t('sys.ipaas.executeTime')">
          {{
            debugNode.endTime && debugNode.startTime ? debugNode.endTime - debugNode.startTime : ''
          }}
          ms
        </a-form-item>
      </a-form>
      <a-button
        v-if="
          debugNode.status === FlowCallLogStatusEnum.Failure &&
          nodeData.connector === ConnectorType.App &&
          [EndpointType.apiConnector, EndpointType.baseHttp].includes(
            nodeData.bizData?.endpointType,
          )
        "
        type="primary"
        size="small"
        class="w100% mt12px"
        ghost
        @click="onConfigParams"
      >
        {{ $t('sys.ipaas.modifyParams') }}
      </a-button>
      <a-button
        v-if="debugNode.status === FlowCallLogStatusEnum.Failure"
        type="primary"
        size="small"
        class="w100% mt20px mb12px"
        @click="onConfigDebugger"
      >
        {{ $t('sys.ipaas.debugger') }}
      </a-button>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane v-if="showInputParams" key="1" :tab="$t('sys.ipaas.requestParams')">
          <div
            v-if="
              !inputParams && !inputHeader && !inputBody && !inputQuery && !inputPath && !inputSql
            "
            class="ks-column items-center"
          >
            <img :src="NoData" width="100" height="100" />
            <div class="text-[#A6A6A6] text-12px">{{ $t('sys.integration.noInfo') }}</div>
          </div>
          <template v-else>
            <CodeSection v-if="inputParams" :json="inputParams" title="Parameters" />
            <CodeSection v-if="inputHeader" :json="inputHeader" title="Header" />
            <CodeSection v-if="inputBody" :json="inputBody" title="Body" />
            <CodeSection v-if="inputQuery" :json="inputQuery" title="Query" />
            <CodeSection v-if="inputPath" :json="inputPath" title="Path" />
            <CodeSection v-if="inputSql" :json="inputSql" title="Sql" />
          </template>
        </a-tab-pane>
        <a-tab-pane v-if="showResult" key="2" :tab="$t('sys.integration.noInfo') ">
          <div
            v-if="
              !outputData &&
              !outputHeader &&
              !outputBody &&
              !outputQuery &&
              !outputPath &&
              !outputExport &&
              !outputTables
            "
            class="ks-column items-center"
          >
            <img :src="NoData" width="100" height="100" />
            <div class="text-[#A6A6A6] text-12px">{{ $t('sys.integration.noInfo') }}</div>
          </div>
          <template v-else>
            <CodeSection v-if="outputData" :json="outputData" title="Data" />
            <CodeSection v-if="outputHeader" :json="outputHeader" title="Header" />

            <template v-if="outputBody">
              <DebugResponseTable
                v-if="nodeData.bizData?.endpointType === EndpointType.db && outputBody?.length"
                :data="outputBody"
              />
              <CodeSection v-else :json="outputBody" title="Body" />
            </template>

            <CodeSection v-if="outputQuery" :json="outputQuery" title="Query" />
            <CodeSection v-if="outputPath" :json="outputPath" title="Path" />
            <CodeSection v-if="outputExport" :json="outputExport" title="Export" />
            <CodeSection v-if="outputTables" :json="outputTables" title="Tables" />
          </template>
        </a-tab-pane>
        <a-tab-pane v-if="showErrorMessage" key="3" :tab="$t('sys.integration.errorReason')">
          <div class="error-gct">
            {{ debugNode.message }}
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="showInputFilter" key="4" :tab="$t('sys.integration.filterDetail')">
          <div v-if="!inputFilter" class="ks-column items-center">
            <img :src="NoData" width="100" height="100" />
            <div class="text-[#A6A6A6] text-12px">{{ $t('sys.integration.noInfo') }}</div>
          </div>
          <CodeSection v-else :json="inputFilter" title="Filter" />
        </a-tab-pane>
        <a-tab-pane v-if="showRcfInput" key="5" :tab="$t('sys.integration.requestBody')">
          <div>{{ $t('sys.integration.callFuncName') }}：{{ debugNode.input?.functionName }}</div>
          <CodeSection v-if="rfcImport" :json="rfcImport" title="IMPORT" />
          <CodeSection v-if="rfcTables" :json="rfcTables" title="TABLES" />
        </a-tab-pane>
      </a-tabs>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useFlow } from '../../hooks/useFlow';
  import { GctFlowNode, useGctFlow } from '@gct/flow';
  import { FlowCallLogStatusEnum } from '../../enums';
  import ParamsConfigModal from './__comps__/params-config-modal.vue';
  import DebugConfigModal from './__comps__/debug-config-modal.vue';
  import DebugResponseTable from './__comps__/debug-response-table.vue';
  import IfCase from './debug-types/if.vue';
  import {
    BpmnNodeTypeEnum,
    ConnectorType,
    EndpointType,
  } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import NoData from '/@/assets/images/empty.png';
  import { CodeSection } from '/@/components/VirtualJsonViewer';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Base;
    readonly: boolean;
  }>();

  const { debugNodeMap, createDebugContext } = useFlow();
  const { flowSelectedId } = useGctFlow();

  const debugNode = computed(() => {
    return debugNodeMap.value[props.nodeData.bizData.nodeId!] || {};
  });

  const inputParams = computed(() => debugNode.value.input?.parameters);
  const inputHeader = computed(() => debugNode.value.input?.headerParameters);
  const inputBody = computed(() => debugNode.value.input?.body);
  const inputQuery = computed(() => debugNode.value.input?.queryParameters);
  const inputPath = computed(() => debugNode.value.input?.uriParameters);
  const inputSql = computed(() => debugNode.value.input?.sql);
  const inputFilter = computed(() => debugNode.value.input?.filter);

  const outputData = computed(() => debugNode.value.output?.data);
  const outputHeader = computed(() => debugNode.value.output?.headerParameters);
  const outputBody = computed(() => debugNode.value.output?.body);
  const outputQuery = computed(() => debugNode.value.output?.queryParameters);
  const outputPath = computed(() => debugNode.value.output?.uriParameters);

  // RFC数据
  const rfcImport = computed(() => debugNode.value.input?.imports);
  const rfcTables = computed(() => debugNode.value.input?.tables);
  const outputExport = computed(() => debugNode.value.output?.export);
  const outputTables = computed(() => debugNode.value.output?.tables);

  /** 是否显示请求入参 */
  const showInputParams = computed(() => {
    return (
      props.nodeData.type !== BpmnNodeTypeEnum.BpmnApiResponse &&
      ![EndpointType.ldap, EndpointType.sapRfc].includes(props.nodeData.bizData?.endpointType)
    );
  });

  /** 显示返回结果 */
  const showResult = computed(() => {
    return !debugNode.value.message;
  });

  /** 显示错误信息 */
  const showErrorMessage = computed(() => {
    return debugNode.value.message;
  });

  /** 显示过滤条件详情 */
  const showInputFilter = computed(() => {
    return props.nodeData.bizData?.endpointType === EndpointType.ldap;
  });

  /** 显示rcf的请求参数 */
  const showRcfInput = computed(() => {
    return props.nodeData.bizData?.endpointType === EndpointType.sapRfc;
  });

  const activeKey = ref();

  watch(
    () => debugNode.value?.message,
    (val) => {
      // 有错误信息
      activeKey.value = val ? '3' : undefined;
    },
    {
      immediate: true,
    },
  );

  const _toJsonString = (data) => {
    if (!data) return '{}';
    let result = data;
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
        result = JSON.stringify(result, null, 2);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        result = JSON.stringify(result, null, 2);
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  };

  const onConfigParams = async () => {
    const res: any = await gct.openUtil.modal(
      ParamsConfigModal,
      {
        form: props.nodeData.bizData.nodeConfig,
        readonly: props.readonly,
        type: 'output',
      },
      {
        title: $t('sys.ipaas.paramsConfig'),
        width: 800,
        okText: $t('sys.okText'),
      },
    );
    if (res.ok) {
      Object.assign(props.nodeData.bizData.nodeConfig, res.params || {});
    }
  };

  const onConfigDebugger = async () => {
    const res: any = await gct.openUtil.modal(
      DebugConfigModal,
      {},
      {
        title: $t('sys.ipaas.debugParamsConfig'),
        width: 640,
        okText: $t('sys.okText'),
      },
    );
    if (res.ok) {
      const { config } = res.params;
      await createDebugContext(props.nodeData.bizData.nodeId, config);
      // eslint-disable-next-line vue/no-mutating-props
      // props.nodeData.step = PanelStep.Debug;
      // emit('toggle-step', PanelStep.Debug);
    }
  };
</script>
<style lang="less" scoped>
  :deep(.ant-form-vertical) {
    .ant-form-item {
      margin: 0;

      & + .ant-form-item {
        margin-top: 8px;
      }
    }

    .ant-form-item-label {
      padding: 0;
      line-height: 22px;

      label {
        color: #797a7d;
        font-size: 12px;
      }
    }

    .ant-form-item-control {
      font-size: 12px;

      .ant-form-item-control-input {
        min-height: 22px;
      }
    }
  }

  :deep(.ant-tabs) {
    .ant-tabs-tab {
      padding: 6px 0;
      font-size: 12px;
    }
  }

  .log-status {
    &--2 {
      color: var(--ant-success-color);
    }

    &--3 {
      color: var(--ant-error-color);
    }
  }
</style>
