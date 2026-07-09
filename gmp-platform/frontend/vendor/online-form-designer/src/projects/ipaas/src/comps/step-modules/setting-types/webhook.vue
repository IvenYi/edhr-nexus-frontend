<template>
  <div>
    <!-- {{ nodeData }} -->
    <!-- {{ formState }} -->
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-form-item :label="t('sys.ipaas.webhookUrl')" name="path">
        <copy-module-key :moduleKey="webhookUrl" />
      </a-form-item>

      <a-form-item
        :label="t('sys.ipaas.requestMethod')"
        name="requestMethod"
        :rules="[{ required: true }]"
      >
        <a-select :disabled="readonly" v-model:value="formState.requestMethod" size="small">
          <a-select-option v-for="item in RequestMethod" :key="item">{{ item }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        :label="t('sys.ipaas.responseMethod.index')"
        name="requestMethod"
        :rules="[{ required: true }]"
      >
        <a-radio-group :disabled="readonly" v-model:value="formState.responseMethod">
          <a-radio v-for="item in ResponseMethod" :key="item" :value="item">{{
            t('sys.ipaas.responseMethod.' + item)
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <InputConfigButton v-model:form="formState" :readonly="readonly" />
      <!-- <a-collapse v-model:activeKey="activeKey" ghost>
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <a-collapse-panel key="1" header="请求参数配置">
          <RequestParams name="请求Query" :list="formState.queryParameters" :disabled="readonly" />
          <RequestParams
            name="请求Header"
            :list="formState.headerParameters"
            :disabled="readonly"
          />
          <a-form-item class="relative">
            <template #label>
              <span>请求Body</span>
              <ParamsTip class="ml-6px" />
            </template>
            <a-button type="primary" size="small" class="w100%" ghost @click="onRequestBodyConfig">
              {{ readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig') }}
            </a-button>
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel
          v-if="formState.responseMethod === ResponseMethod.ASYNC"
          key="2"
          header="响应参数配置"
        >
          <a-form-item class="relative">
            <template #label>
              <span>响应Body</span>
              <ParamsTip class="ml-6px" />
            </template>
            <a-button type="primary" size="small" class="w100%" ghost @click="onResponseBodyConfig">
              {{ readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig') }}
            </a-button>
          </a-form-item>
        </a-collapse-panel>
      </a-collapse> -->
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, computed, onBeforeUnmount } from 'vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useI18n } from '/@/hooks/web/useI18n';
  import parameterStructModal, { ParameterTypeEnum } from '../../components/ParameterStruct';
  import RequestParams from '../../components/request-params.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { RequestMethod, ResponseMethod } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useFlow } from '/@ipaas/hooks/useFlow';
  import type { GctFlowNode } from '@gct/flow';
  import ParamsTip from '/@ipaas/comps/step-modules/__comps__/params-tip.vue';
  import InputConfigButton from '../__comps__/input-config-button.vue';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Trigger;
    readonly: boolean;
  }>();

  const { fuuid } = useFlow();

  const { host } = useGlobSetting();

  const { t } = useI18n();
  const formRef = ref();
  const activeKey = ref(['1', '2']);

  console.log(props.node);
  // const formState = reactive<NodeBizDataSchema.Webhook['nodeConfig']>(
  //   props.nodeData.bizData.nodeConfig,
  // );

  const formState = computed<NodeBizDataSchema.Webhook['nodeConfig']>({
    get() {
      return props.nodeData.bizData.nodeConfig as any;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig = value;
    },
  });

  const webhookUrl = computed(() => {
    const hostUrl = import.meta.env.DEV ? host : window.location.origin;
    return `${hostUrl}/gct-ipaas/api/webhook${
      formState.value.responseMethod === ResponseMethod.ASYNC ? '/async' : ''
    }/rest/${fuuid.value}`;
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
        type: 'input',
        disabled: !!props.readonly,
      },
      {
        title: props.readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig'),
        width: '800px',
        showFooter: !props.readonly,
      },
    );
    if (!res.ok) return;
    formState.value.body = JSON.parse(res.data);
  };

  // body参数配置
  const onResponseBodyConfig = async () => {
    if (!formState.value.outputBody || formState.value.outputBody.length <= 0) {
      formState.value.outputBody = [
        {
          key: 'body',
          keyType: ParameterTypeEnum.Object,
          value: '',
        },
      ];
    }
    formState.value.outputBody[0].key = 'body';

    const res: { ok: boolean; data: string } = await gct.openUtil.modal(
      parameterStructModal,
      {
        json: JSON.stringify(formState.value.outputBody),
        type: 'output',
        disabled: !!props.readonly,
      },
      {
        title: props.readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig'),
        width: '800px',
        showFooter: !props.readonly,
      },
    );
    if (!res.ok) return;
    formState.value.outputBody = JSON.parse(res.data);
  };

  const validateForm = async () => {
    // formRef.value
    //   ?.validate()
    //   .then(() => {
    //     props.node.tooltips = [];
    //   })
    //   .catch((err) => {
    //     props.node.tooltips = err.errorFields.reduce((arr, cur) => {
    //       arr.push(...cur.errors);
    //       return arr;
    //     }, []);
    //   });
  };

  onBeforeUnmount(() => {
    validateForm();
  });
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

  :deep(.copy-wrap span) {
    font-size: 12px !important;
    word-break: break-all;
  }
</style>
