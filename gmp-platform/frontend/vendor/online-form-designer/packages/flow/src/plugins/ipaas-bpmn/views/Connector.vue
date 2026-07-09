<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />
    <NodeInstStatus :node="node" />
    <NodeInfoPopover
      :node="node"
      :config-data="{
        ...(node?.data?.bizData?.nodeConfig || {}),
        appName,
        bsName,
        dsName,
        dsType,
        ...adConfigInfo,
      }"
    >
      <div
        class="gct-flow__node gct-flow__node--app flex items-center relative"
        :class="[
          nodeInstStatusMap[node.id]?.status,
          {
            selected: !isInstMode && nodeSelectedId === node.id,
            'inst-mode': isInstMode,
          },
        ]"
      >
        <div class="gct-flow__node-icon">
          <i v-if="nodeData?.connector && nodeIcon" class="iconfont" :class="[nodeIcon]"></i>
          <icon-park v-else type="api-app" />
        </div>
        <div class="gct-flow__node-content ks-col overflow-hidden">
          <div class="overflow-hidden">
            <!-- 连接器 -->
            <div class="flex">
              <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
              <div class="ks-col ell">
                <span
                  v-if="nodeData?.connector === ConnectorType.Http"
                  class="text-[#212528] font-500"
                >
                  BaseHttp
                </span>
                <div
                  v-else-if="
                    nodeData?.bizData.nodeConfig?.authId || nodeData?.bizData.nodeConfig?.appTag
                  "
                  class="text-[#212528] font-500 w100% overflow-hidden ell"
                  >{{ appName ?? $t('sys.app.index') }}</div
                >
                <div
                  v-else-if="nodeData?.bizData.nodeConfig?.apiId"
                  class="text-[#212528] font-500 w100% overflow-hidden ell"
                  >{{ apiName ?? $t('sys.app.index') }}</div
                >
                <span
                  v-else-if="nodeData?.connector === ConnectorType.Db"
                  class="text-[#212528] font-500"
                >
                  {{ dsName || $t('sys.ipaas.database') }}
                </span>
                <span v-else>--</span>
              </div>
              <div
                v-if="nodeData?.bizData.nodeConfig?.appTag && nodeData?.bizData?.nodeConfig.env"
                class="node-tag"
                :class="[
                  nodeData?.bizData?.nodeConfig.env === 'test' && 'test',
                  nodeData?.bizData?.nodeConfig.env === 'prod' && 'prod',
                ]"
              >
                {{ $t(`sys.ipaas.env_short.${nodeData?.bizData?.nodeConfig.env}`) }}
              </div>
            </div>
            <div class="text-[#5C5C5C] ell mt-4px">
              <template v-if="nodeData?.connector === ConnectorType.App">
                {{
                  bsName ||
                  adConfigInfo?.loginAddress ||
                  `${
                    nodeData?.bizData?.nodeConfig?.httpConfig
                      ? nodeData?.bizData?.nodeConfig?.httpConfig?.protocol +
                        '://' +
                        (nodeData?.bizData?.nodeConfig?.httpConfig?.host || '')
                      : ''
                  }${nodeData?.bizData?.nodeConfig?.path || ''}` ||
                  $t('sys.ipaas.appConnector')
                }}
              </template>
              <template v-else-if="nodeData?.connector === ConnectorType.Http">
                {{ nodeData?.bizData?.nodeConfig?.httpMethod || $t('sys.ipaas.httpConnector') }}
              </template>
              <template v-else-if="nodeData?.connector === ConnectorType.Db">
                {{ dsType ? $t(`sys.component.dataConnection.db.${dsType}`) : $t('sys.ipaas.databaseConnector') }}
              </template>
              <template v-else>{{ $t('sys.ipaas.pleaseSelectConnector') }}</template>
            </div>
          </div>
        </div>
      </div>
    </NodeInfoPopover>
  </div>
</template>

<script setup lang="ts">
  import { computed, watch, ref } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { ConnectorType, EndpointType } from '../enums';
  import { NodeDataSchema, GctBpmnNode } from '../types';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import NodeInfoPopover from '../comps/node-info-popover/index.vue';
  import { getAppName, getBSName, geApiConnectorName } from '../utils';
  import { getDataSourceFindById } from '/@/apis/gct-platform/DataSourceController';
  import { useRoute, useRouter } from 'vue-router';
  import { getConnectorConfigByAppid } from '/@/apis/gct-ipaas2/ConnectorConfigController';

  const props = defineProps<{
    node: GctBpmnNode.BpmnConnector;
  }>();
  const { gctFlowDataMap, onNodeClick, nodeSelectedId, isInstMode, nodeInstStatusMap } =
    useGctFlow();
  /**
   * 节点上挂载的数据
   */
  const nodeData = computed<NodeDataSchema.Base | undefined>(() => {
    return props.node.data;
  });

  const nodeConfig = computed(() => {
    return props.node.data?.bizData?.nodeConfig;
  });
  const route = useRoute();
  const routeQuery = computed(() => {
    return route?.query || {};
  });

  const appName = ref();
  const bsName = ref();
  const dsName = ref();
  const dsType = ref();

  const iconMap = {
    [ConnectorType.Http]: 'icon-http',
    [ConnectorType.Db]: 'icon-shujumoxing',
    [EndpointType.modelBs]: 'icon-neibuyingyong',
    [EndpointType.apiConnector]: 'icon-waibuyingyong',
  };

  const nodeIcon = computed(() => {
    const connector = nodeData.value?.connector;
    if (connector !== ConnectorType.App) {
      return iconMap[connector];
    } else if (nodeData.value?.bizData?.endpointType)
      return iconMap[nodeData.value.bizData.endpointType];
    return '';
  });

  const apiName = computed(() => {
    return nodeConfig.value?.apiId
      ? $t(`sys.ipaas.asyncPlatformTypes.${nodeConfig.value?.apiId}`)
      : '';
  });

  watch(
    () => nodeConfig.value?.appTag,
    async (val) => {
      // 内部应用名称的回显
      if (val) {
        appName.value = await getAppName(nodeConfig.value?.appTag);
      } else {
        appName.value = '';
      }
    },
    {
      immediate: true,
    },
  );

  const adConfigInfo = ref<any>({});

  watch(
    () => nodeConfig.value?.authId,
    async (val) => {
      const endpointType = nodeData.value?.bizData?.endpointType;
      // 外部应用名称的回显
      const { appTag, branchId, env } = routeQuery.value;
      if (val) {
        appName.value = await geApiConnectorName(
          nodeConfig.value?.authId,
          appTag
            ? {
                'App-Tag': appTag,
                'Branch-Id': branchId,
                Env: env,
              }
            : {},
        );
      } else {
        appName.value = '';
      }
      // AD域的外部连接器配置
      if (endpointType === EndpointType.ldap) {
        adConfigInfo.value =
          (await getConnectorConfigByAppid({ id: nodeConfig.value?.appId })) || {};
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    [
      () => nodeConfig.value?.env,
      () => nodeConfig.value?.branchId,
      () => nodeConfig.value?.modelKey,
      () => nodeConfig.value?.appTag,
      () => nodeConfig.value?.bsKey,
    ],
    async () => {
      // 业务服务名称的回显
      const { modelKey, env, appTag, branchId, bsKey } = nodeConfig.value || {};
      if (modelKey && appTag && bsKey && ((env === 'dev' && branchId) || (env && env !== 'dev'))) {
        bsName.value = await getBSName(modelKey, bsKey, {
          'App-Tag': appTag,
          'Branch-Id': branchId,
          Env: env,
        });
      } else {
        bsName.value = '';
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    () => nodeConfig.value?.dsId,
    async (id) => {
      // 数据源回显
      if (id) {
        const res: any = await getDataSourceFindById({ id });
        dsName.value = res?.name;
        dsType.value = res?.type;
      } else {
        dsName.value = '';
        dsType.value = '';
      }
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  // .gct-flow__node.inst-finished {
  //   border-color: #309c41;
  //   border-width: 2px;
  // }
  .node-tag {
    height: 18px;
    padding: 0 6px;
    border-radius: 4px;
    background: rgb(2 106 200 / 16%);
    color: #026ac8;
    font-size: 12px;
    line-height: 18px;
    // position: absolute;
    // right: 16px;
    // top: 17px;

    &.test {
      background: rgb(255 139 22 / 16%);
      color: #ff8b16;
    }

    &.prod {
      background: rgb(8 140 73 / 16%);
      color: #088c49;
    }
  }
</style>
