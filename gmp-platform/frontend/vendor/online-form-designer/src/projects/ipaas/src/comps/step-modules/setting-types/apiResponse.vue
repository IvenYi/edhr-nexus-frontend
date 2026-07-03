<template>
  <div>
    <a-form :model="formState" autocomplete="off" layout="vertical">
      <!-- <a-collapse v-model:activeKey="activeKey" ghost>
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <a-collapse-panel key="1" header="响应参数配置">
        </a-collapse-panel>
      </a-collapse> -->
      <a-form-item
        :label="$t('sys.ipaas.responseType')"
        class="relative"
        name="responseParamType"
        :rules="[{ required: true }]"
      >
        <a-select v-model:value="formState.responseParamType" size="small" :disabled="readonly">
          <a-select-option v-for="item in ResponseParamType" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <!-- <a-button type="primary" size="small" class="w100% mt12px" ghost @click="onConfigParams">
        {{ readonly ? '查看参数配置' : '参数配置' }}
      </a-button> -->
      <ParamsConfigButton :readonly="readonly" :form="formState" :hideTabs="['path', 'query']" />
      <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" />
      <!-- <ResponseParams
        name="响应Header"
        :list="formState.headerParameters"
        :disabled="readonly"
        type="value"
      />
      <a-form-item class="relative">
        <template #label>
          <span>响应Body</span>
          <ParamsTip class="ml-6px" />
        </template>
        <a-button type="primary" size="small" class="w100%" ghost @click="onConfig">
          {{ readonly ? '查看参数配置' : '参数配置' }}
        </a-button>
      </a-form-item> -->
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import parameterStructModal, { ParameterTypeEnum } from '../../components/ParameterStruct';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { ResponseParamType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  // import ResponseParams from '../../components/response-params.vue';
  import type { GctFlowNode } from '@gct/flow';
  // import ParamsTip from '/@ipaas/comps/step-modules/__comps__/params-tip.vue';
  import ParamsConfigModal from '../__comps__/params-config-modal.vue';
  import DebugButton from '../__comps__/debug-button.vue';
  import ParamsConfigButton from '../__comps__/params-config-button.vue';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.ApiResponse;
    readonly: boolean;
  }>();

  // const { t } = useI18n();

  const activeKey = ref('1');

  const formState = reactive<NodeBizDataSchema.ApiResponse['nodeConfig']>(
    props.nodeData.bizData.nodeConfig,
  );

  const onConfigParams = async () => {
    const res: any = await gct.openUtil.modal(
      ParamsConfigModal,
      {
        form: formState,
        readonly: props.readonly,
        type: 'output',
        hideTabs: ['path', 'query'],
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

  // body参数配置
  const onConfig = async () => {
    if (!formState.body || formState.body.length <= 0) {
      formState.body = [
        {
          key: 'body',
          keyType: ParameterTypeEnum.Object,
          value: '',
        },
      ];
    }
    formState.body[0].key = 'body';

    const res: { ok: boolean; data: string } = await gct.openUtil.modal(
      parameterStructModal,
      {
        json: JSON.stringify(formState.body),
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

    formState.body = JSON.parse(res.data);
  };

  //请求头和query参数，添加
  const addParam = (list) => {
    list.unshift({ key: '', value: '' });
  };

  //请求头和query参数，删除
  const deleteParam = (list, idx) => {
    list.splice(idx, 1);
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
