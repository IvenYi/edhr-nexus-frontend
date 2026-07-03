<template>
  <div v-if="endpointType" class="node-popover w238px">
    <template v-if="endpointType === EndpointType.modelBs">
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.ipaas.appName') }}：</div>
        <div
          class="node-popover-content"
          :title="`${configData?.appName} (${$t(`sys.ipaas.appTypes.${endpointType}`)})`"
        >
          {{ configData?.appName }} ({{ $t(`sys.ipaas.appTypes.${endpointType}`) }})
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.ipaas.envSelect') }}：</div>
        <div class="node-popover-content">{{ $t(`sys.ipaas.env.${configData?.env}`) }}</div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.pageDesigner.businessService') }}：</div>
        <div class="node-popover-content" :title="configData?.bsName">
          {{ configData?.bsName }}
        </div>
      </div>
    </template>
    <template
      v-else-if="
        endpointType === EndpointType.apiConnector || endpointType === EndpointType.baseHttp
      "
    >
      <div v-show="endpointType === EndpointType.apiConnector" class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.ipaas.appName') }}：</div>
        <div
          class="node-popover-content"
          :title="`${configData?.appName} (${$t(`sys.ipaas.appTypes.${node?.data?.bizData?.appType}`)})`"
        >
          {{ configData?.appName }} ({{ $t(`sys.ipaas.appTypes.${node?.data?.bizData?.appType}`) }})
        </div>
      </div>
      <div v-if="configData?.httpConfig" class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.ipaas.domain') }}：</div>
        <div
          class="node-popover-content"
          :title="`${configData?.httpConfig?.protocol}://${configData?.httpConfig?.host ?? ''}`"
        >
          {{ configData?.httpConfig?.protocol }}://{{ configData?.httpConfig?.host ?? '' }}
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.integration.requestAddress') }}：</div>
        <div class="node-popover-content" :title="configData?.path">{{ configData?.path }}</div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.ipaas.requestMethod') }}：</div>
        <div class="node-popover-content">{{ configData?.httpMethod }}</div>
      </div>
    </template>
    <template v-else-if="endpointType === EndpointType.db">
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.integration.dataSource') }}：</div>
        <div class="node-popover-content ks-row">
          <div class="overflow-hidden ell" :title="configData?.dsName">{{
            configData?.dsName
          }}</div>
          <div style="flex-shrink: 0">
            /
            {{
              configData?.dsType ? $t(`sys.component.dataConnection.db.${configData?.dsType}`) : ''
            }}</div
          >
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label">{{ $t('sys.env') }}：</div>
        <div class="node-popover-content">{{ $t(`sys.ipaas.env.${configData?.env}`) }}</div>
      </div>
    </template>
    <template v-else-if="endpointType === EndpointType.ldap">
      <div class="node-popover-item">
        <div class="node-popover-label w90px!">{{ $t('sys.integration.serverAddress') }}：</div>
        <div class="node-popover-content" :title="configData?.loginAddress">
          {{ configData?.loginAddress }}
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label w90px!">{{ $t('sys.integration.loginAccount2') }}：</div>
        <div class="node-popover-content" :title="adAcount">
          {{ adAcount }}
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label w90px!">{{ $t('sys.ipaas.domainScope') }}：</div>
        <div class="node-popover-content" :title="configData?.baseDn">
          {{ configData?.baseDn }}
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label w90px!">{{ $t('sys.ipaas.searchTargetObj') }}：</div>
        <div class="node-popover-content" :title="configData?.objectClass">
          {{ configData?.objectClass }}
        </div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label w90px!">{{ $t('sys.integration.nodeId') }}：</div>
        <div class="node-popover-content" :title="node?.data?.bizData?.nodeId">
          <copy-module-key :moduleKey="node?.data?.bizData?.nodeId" />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { GctBpmnNode } from '../../../types';
  import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const props = defineProps<{
    node: GctBpmnNode.BpmnConnector;
    configData: any;
  }>();

  const endpointType = computed((): EndpointType | undefined => {
    return props.node?.data?.bizData?.endpointType;
  });

  const adAcount = computed(() => {
    return props.configData?.authFormConfig?.find((e) => e.key === 'account')?.value;
  });
</script>
<style lang="less" scoped></style>
