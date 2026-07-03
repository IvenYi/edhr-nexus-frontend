<template>
  <div>
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-form-item :label="$t('sys.integration.adServerAddress')" class="readonly-item">
        <div class="text-12px">{{ configInfo?.loginAddress }}</div>
      </a-form-item>
      <a-form-item :label="$t('sys.integration.loginAccount2')" class="readonly-item">
        <div class="text-12px">
          {{ configInfo?.authFormConfig?.find((e) => e.key === 'account')?.value }}
        </div>
      </a-form-item>
      <a-form-item :label="$t('sys.integration.baseDn')" name="baseDn" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.baseDn"
          size="small"
          :placeholder="t('sys.inputText')"
          :disabled="readonly"
        />
      </a-form-item>
      <div class="text-12px text-[#C3C3C3]">
        {{ $t('sys.integration.adNodeTip') }}
      </div>
      <a-form-item
        :label="$t('sys.integration.objectClass')"
        name="objectClass"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.objectClass"
          size="small"
          :placeholder="t('sys.inputText')"
          :disabled="readonly"
        />
      </a-form-item>
      <div class="text-12px text-[#C3C3C3]">
        {{ $t('sys.ipaas.userTip') }}
        <br />
        {{ $t('sys.ipaas.orgTip') }}
        <br />
        {{ $t('sys.ipaas.useOrgTip') }}
      </div>
      <a-form-item :label="$t('sys.ipaas.filterTip')" name="filter" class="relative">
        <div
          class="primary-gct text-12px absolute right-0px top--20px cursor-pointer"
          @click="onShowHelp"
        >
          {{ $t('sys.ipaas.clickViewHelp') }}
        </div>
        <a-textarea
          v-model:value="formState.filter"
          :rows="4"
          :placeholder="t('sys.inputTextTip', { name: $t('sys.ipaas.filterHelpTip') })"
          :disabled="readonly"
        />
      </a-form-item>
      <a-form-item :label="$t('sys.ipaas.queryMethod')" name="scope">
        <a-radio-group v-model:value="formState.scope">
          <a-radio :value="LdapScopeEnum.One">{{
            t(`sys.ipaas.ldapScopeTypes.${LdapScopeEnum.One}`)
          }}</a-radio>
          <a-radio :value="LdapScopeEnum.Sub">{{
            t(`sys.ipaas.ldapScopeTypes.${LdapScopeEnum.Sub}`)
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" :disabled="readonly" />
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { LdapScopeEnum } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import type { GctFlowNode } from '@gct/flow';
  import DebugButton from '../__comps__/debug-button.vue';
  import { getConnectorConfigByAppid } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import { ConnectorConfigResponse } from '/@/apis/gct-ipaas2/model';
  import LdapFilterHelp from '../__comps__/ldap-filter-help.vue';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const { t } = useI18n();
  const formRef = ref();
  const configInfo = ref<ConnectorConfigResponse>();

  const formState = computed<NodeBizDataSchema.Ldap['nodeConfig']>({
    get() {
      return props.nodeData.bizData.nodeConfig as any;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig = value;
    },
  });

  onMounted(() => {
    getAppConfig();
  });

  const getAppConfig = async () => {
    configInfo.value =
      (await getConnectorConfigByAppid({ id: props.nodeData.bizData?.nodeConfig?.appId })) || {};
  };

  const onShowHelp = async () => {
    await gct.openUtil.modal(
      LdapFilterHelp,
      {},
      {
        title: t('sys.ipaas.comLdapFilterHelp'),
        showFooter: false,
        width: 640,
      },
    );
  };
</script>
<style lang="less" scoped>
  .add-btn {
    position: absolute;
    top: -22px;
    right: 0;
    padding: 0;
  }

  .params-wrap {
    border-radius: 4px;
    background-color: #f2f4f7;

    & + .params-wrap {
      margin-top: 4px;
    }
  }

  :deep(.ant-form label) {
    font-size: 12px;
  }

  :deep(.ant-radio-inner) {
    width: 12px;
    height: 12px;
  }
</style>
