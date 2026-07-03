<template>
  <div>
    <!-- {{ nodeData }} -->
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <!-- <a-collapse v-model:activeKey="activeKey" ghost>
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <a-collapse-panel key="1" header="请求参数">
        </a-collapse-panel>
      </a-collapse> -->
      <a-form-item :label="$t('sys.ipaas.reqPath')" name="path" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.path"
          size="small"
          :placeholder="t('sys.inputText')"
          :disabled="readonly"
        />
      </a-form-item>

      <a-form-item :label="$t('sys.ipaas.requestMethod')" name="httpMethod" :rules="[{ required: true }]">
        <a-select v-model:value="formState.httpMethod" size="small" :disabled="readonly">
          <a-select-option v-for="item in HttpMethod" :key="item">{{ item }}</a-select-option>
        </a-select>
      </a-form-item>

      <!-- <a-form-item label="报文类型" name="paramType" :rules="[{ required: true }]">
        <a-select v-model:value="formState.paramType" size="small" :disabled="readonly">
          <a-select-option v-for="item in ParamType" :key="item">{{ item }}</a-select-option>
        </a-select>
      </a-form-item> -->
      <a-form-item :label="$t('sys.ipaas.encoding')" name="encode" :rules="[{ required: true }]">
        <a-select v-model:value="formState.encode" size="small" :disabled="readonly">
          <a-select-option value="UTF_8">utf-8</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="$t('sys.ipaas.timeOutSec')" name="connectTimeOut">
        <a-input-number
          v-model:value="formState.connectTimeOut"
          :min="0"
          :precision="0"
          size="small"
          :placeholder="t('sys.inputText')"
          :disabled="readonly"
        />
        <div class="text-[#C3C3C3] text-12px mt2px font-300">{{ $t('sys.ipaas.timeOutTip') }}</div>
      </a-form-item>
      <!-- <a-button type="primary" size="small" class="w100% mt12px" ghost @click="onConfigParams">
        {{ readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig') }}
      </a-button> -->
      <ParamsConfigButton :readonly="readonly" :form="formState" />
      <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" />
      <!-- <RequestParams name="请求path" :list="formState.uriParameters" :disabled="readonly" />
      <RequestParams name="请求Query" :list="formState.queryParameters" :disabled="readonly" />
      <RequestParams name="请求Header" :list="formState.headerParameters" :disabled="readonly" /> -->

      <!-- <a-form-item calss="relative">
        <template #label>
          <span>请求Body</span>
          <ParamsTip class="ml-6px" />
        </template>
        <a-button type="primary" size="small" class="w100%" ghost @click="onConfigParams">
          {{ readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig') }}
        </a-button>
      </a-form-item> -->
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import parameterStructModal, { ParameterTypeEnum } from '../../components/ParameterStruct';
  import { HttpMethod, ParamType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  // import RequestParams from '../../components/request-params.vue';
  import type { GctFlowNode } from '@gct/flow';
  // import { useValidate } from '/@ipaas/hooks/useValidator';
  // import ParamsTip from '/@ipaas/comps/step-modules/__comps__/params-tip.vue';
  import ParamsConfigModal from '../__comps__/params-config-modal.vue';
  import DebugButton from '../__comps__/debug-button.vue';
  import ParamsConfigButton from '../__comps__/params-config-button.vue';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const { t } = useI18n();
  const formRef = ref();

  // useValidate(formRef, props);

  // const formState = reactive<NodeBizDataSchema.BaseHttp['nodeConfig']>(
  //   props.nodeData.bizData.nodeConfig,
  // );

  const formState = computed<NodeBizDataSchema.BaseHttp['nodeConfig']>({
    get() {
      return props.nodeData.bizData.nodeConfig as any;
    },
    set(val) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig = val;
    },
  });

  // body参数配置
  const onRequestBodyConfig = async () => {
    if (!formState.value.body || formState.value.body.length <= 0) {
      formState.value.body = [
        {
          key: 'body',
          keyType: ParameterTypeEnum.Object,
          value: '',
        },
      ];
    }
    formState.value.body[0].key = 'body';

    const res: { ok: boolean; data: string } = await gct.openUtil.modal(
      parameterStructModal,
      {
        json: JSON.stringify(formState.value.body),
        type: 'output',
        disabled: !!props.readonly,
      },
      {
        title: props.readonly ? $t('sys.ipaas.viewParamsConfig') : $t('sys.ipaas.paramsConfig'),
        width: '800px',
        showFooter: !props.readonly,
      },
    );
    if (!res.ok) return;

    formState.value.body = JSON.parse(res.data);
  };

  const onConfigParams = async () => {
    const res: any = await gct.openUtil.modal(
      ParamsConfigModal,
      {
        form: formState,
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
      Object.assign(formState, res.params || {});
    }
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
</style>
