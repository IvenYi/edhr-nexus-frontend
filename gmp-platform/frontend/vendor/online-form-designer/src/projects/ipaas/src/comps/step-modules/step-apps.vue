<template>
  <!-- <SimpleCollapse title="应用选择">
  </SimpleCollapse> -->
  <div class="my12px h100% overflow-hidden">
    <div
      v-show="activeKey === 1"
      v-for="item in Object.values(AppTypes)"
      :key="item"
      class="connector-app__option mt5px mx12px"
      :class="{
        selected: item === nodeData.bizData.appType,
        'important-cursor-not-allowed': flowReadonly,
      }"
      @click="changeAppType(item)"
    >
      {{ $t(`sys.ipaas.appTypes.${item}`) }}
      <i class="iconfont icon-xuanze"></i>
    </div>
    <div v-show="activeKey === 2" class="h100%">
      <AppList
        v-if="nodeData.bizData.appType === AppTypes.Internal"
        :value="nodeData.bizData.nodeConfig?.appTag"
        :disabled="flowReadonly"
        @change="(value) => handleInternalAppClick(value)"
      />
      <ConnectorAppOpts
        v-else-if="nodeData.bizData.appType === AppTypes.External"
        :value="nodeData.bizData.nodeConfig?.authId"
        :disabled="flowReadonly"
        @change="(value) => handleExternalAppClick(value)"
      />
      <ConnectorPlatformOpts
        v-else-if="nodeData.bizData.appType === AppTypes.Platform"
        :value="nodeData.bizData.nodeConfig?.apiId"
        :disabled="flowReadonly"
        @change="(value) => handlePlatformClick(value)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { EndpointType, PanelStep, ProtocolTypes } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { useFlow } from '../../hooks/useFlow';
  import ConnectorAppOpts from './__comps__/connector-app-opts.vue';
  import AppList from './__comps__/app-list.vue';
  import { ref } from 'vue';
  import { AppTypes } from '../../enums';
  import ConnectorPlatformOpts from './__comps__/connector-platform-opts.vue';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { AuthModeEnum } from '/@ipaas/enums';
  // import SimpleCollapse from './__comps__/simple-collapse.vue';
  // eslint-disable vue/no-mutating-props

  const emit = defineEmits(['toggle-step']);

  const props = defineProps<{
    // node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();

  const userStore = useUserStoreWithOut();
  const { createNodeBizData, flowReadonly, appInfo } = useFlow();
  const activeKey = ref(1);
  const appTypesMap = {
    // [AppTypes.External]: '',
    [AppTypes.Internal]: EndpointType.modelBs,
    [AppTypes.Platform]: EndpointType.platform,
  };

  /**
   * 连接器 - 应用 变化
   */
  const handleExternalAppClick = (item) => {
    if (flowReadonly.value) return;
    console.log('handleExternalAppClick', item);
    if (props.nodeData.bizData.nodeConfig?.authId !== item.id) {
      const authModeToType = {
        [AuthModeEnum.AD]: EndpointType.ldap,
        [AuthModeEnum.SAP_RFC]: EndpointType.sapRfc,
      };
      const type = authModeToType[item.authMode] ?? EndpointType.apiConnector;
      props.nodeData.bizData = createNodeBizData(type, props.nodeData?.bizData);
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig!['authId'] = item.id;
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig!['branchId'] = item.branchId;
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig!['env'] = item.env;
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig!['platformAppId'] = item.platformAppId;
      // 连接器的id
      props.nodeData.bizData.nodeConfig!['appId'] = item.appId;
      // props.nodeData.bizData.nodeConfig!['dynamicDomain'] = item.dynamicDomain;
      props.nodeData.bizData.nodeConfig!['httpConfig'] = item.dynamicDomain
        ? {
            protocol: ProtocolTypes.Http,
          }
        : undefined;
    }
    // if (type === EndpointType.modelBs && props.nodeData.bizData.nodeConfig?.appTag !== item.id) {
    //   // eslint-disable-next-line vue/no-mutating-props
    //   props.nodeData.bizData = createNodeBizData(type, props.nodeData?.bizData);
    //   // eslint-disable-next-line vue/no-mutating-props
    //   props.nodeData.bizData.nodeConfig['env'] = appInfo.value.appTag ? appInfo.value.env : 'dev';
    //   // eslint-disable-next-line vue/no-mutating-props
    //   props.nodeData.bizData.nodeConfig!['appTag'] = item.id;
    // }
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };

  // 内部应用
  const handleInternalAppClick = (item) => {
    if (flowReadonly.value) return;
    if (props.nodeData.bizData.nodeConfig?.appTag !== item.id) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData = createNodeBizData(EndpointType.modelBs, props.nodeData?.bizData);
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig['env'] = appInfo.value.appTag ? appInfo.value.env : 'dev';
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig!['appTag'] = item.id;
    }
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };

  // 平台
  const handlePlatformClick = (item) => {
    if (flowReadonly.value) return;
    if (props.nodeData.bizData.nodeConfig?.apiId !== item.id) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData = createNodeBizData(EndpointType.platform, props.nodeData?.bizData);
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig!['tenantId'] = userStore.tenantId;
      props.nodeData.bizData.nodeConfig!['apiId'] = item.id;
    }
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.step = PanelStep.Setting;
    emit('toggle-step', props.nodeData.step);
  };

  const changeAppType = (type) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.nodeData.bizData.appType = type;
    if (
      appInfo.value.appTag &&
      type === AppTypes.Internal &&
      props.nodeData.bizData.endpointType === EndpointType.modelBs
    ) {
      emit('toggle-step', PanelStep.Setting);
    } else {
      activeKey.value = 2;
    }
    if (flowReadonly.value) return;
    if (type !== props.nodeData.bizData.appType) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.endpointType = appTypesMap[type];
      if (props.nodeData.bizData.nodeConfig) {
        // eslint-disable-next-line vue/no-mutating-props
        props.nodeData.bizData.nodeConfig['appTag'] = undefined;
        // eslint-disable-next-line vue/no-mutating-props
        props.nodeData.bizData.nodeConfig['authId'] = undefined;
      }
      if (type === AppTypes.Internal && appInfo.value.appTag) {
        handleInternalAppClick({ id: appInfo.value.appTag });
        emit('toggle-step', PanelStep.Setting);
      }
    }
  };
</script>
<style lang="less" scoped>
  @import './step-panel.less';

  .connector-app {
    &__option {
      height: 52px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #f0f0f0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      // padding: 10px 8px;
      cursor: pointer;

      &:not(:last-child) {
        margin-bottom: 12px;
      }

      .iconfont.icon-xuanze {
        position: absolute;
        top: 0;
        right: 0;
        color: var(--ant-primary-color);
        display: none;
        line-height: 1;
        top: -5px;
        right: -5px;
        background-color: #fff;
        font-size: 12px;
      }

      & > div:first-child {
        height: 32px;
        width: 32px;
        border-radius: 4px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: 20px;
        color: #fff;
        background: var(--color);
        line-height: 1em;
      }

      & > div:nth-child(2) {
        color: #797a7d;
        flex: 1;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 12px;
        position: relative;
      }

      &:hover {
        background: #fafafa;
      }

      &.selected {
        background: #fafafa;
        border-color: var(--ant-primary-color);

        & > div:nth-child(2) {
          color: var(--ant-primary-color);
        }

        .iconfont.icon-xuanze {
          display: block;
        }
      }
    }
  }
</style>
