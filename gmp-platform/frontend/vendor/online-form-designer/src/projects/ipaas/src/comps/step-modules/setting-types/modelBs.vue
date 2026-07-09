<template>
  <div>
    <!-- {{ nodeData }} -->
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-form-item :label="$t('sys.ipaas.dataType')" name="dataType" :rules="[{ required: true }]">
        <a-select v-model:value="formState.dataType" size="small" :disabled="readonly">
          <a-select-option value="business">{{ $t('sys.ipaas.businessData') }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="!appInfo.appTag" :label="$t('sys.ipaas.envSelect')" name="env" :rules="[{ required: true }]">
        <a-select
          v-model:value="formState.env"
          size="small"
          :disabled="readonly"
          @change="hanleEnvChange"
        >
          <a-select-option v-for="item in EnvTypeEnum" :key="item" :value="item">
            {{ $t(`sys.ipaas.env.${item}`) }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('sys.modelSelect')" name="modelKey" :rules="[{ required: true }]">
        <a-input-group compact>
          <a-select
            v-model:value="catetegoryType"
            size="small"
            :disabled="readonly"
            style="width: 30%"
            :options="modelTypes"
            @change="handleCategoryChange"
          />
          <a-select
            v-model:value="formState.modelKey"
            size="small"
            :disabled="readonly"
            style="width: 70%"
            showSearch
            showArrow
            optionFilterProp="name"
            :fieldNames="{ label: 'name', value: 'key' }"
            :options="modelOptions"
            :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.model') })"
            @change="() => (formState.bsKey = undefined)"
          >
            <a-select-option v-for="item in HttpMethod" :key="item">{{ item }}</a-select-option>
          </a-select>
        </a-input-group>
      </a-form-item>
      <a-form-item :label="$t('sys.pageDesigner.businessService')" name="bsKey" :rules="[{ required: true }]">
        <a-select
          v-model:value="formState.bsKey"
          size="small"
          :disabled="readonly"
          showSearch
          showArrow
          optionFilterProp="label"
          :options="bsOptions"
          :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.pageDesigner.businessService') })"
        />
      </a-form-item>
      <!-- <a-button
        v-show="formState.bsKey"
        type="primary"
        size="small"
        class="w100% mt12px"
        ghost
        @click="onConfigParams"
      >
        {{ readonly ? t('sys.ipaas.viewParamsConfig') : t('sys.ipaas.paramsConfig') }}
      </a-button> -->
      <ParamsConfigButton
        v-show="formState.bsKey"
        :readonly="readonly"
        :form="formState"
        :hideTabs="['header', 'path']"
      />
      <DebugButton
        v-show="formState.bsKey && !readonly"
        :nodeId="nodeData.bizData.nodeId"
        :disabled="readonly"
      />
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  // import parameterStructModal, { ParameterTypeEnum } from '../../components/ParameterStruct';
  import { HttpMethod } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import type { GctFlowNode } from '@gct/flow';
  import { getModelMetaFindAllByTypeIn } from '/@/apis/gct-apaas/ModelMetaController';
  import ParamsConfigModal from '../__comps__/params-config-modal.vue';
  import { getAppBranchList } from '/@/apis/gct-apaas/AppBranchController';
  import DebugButton from '../__comps__/debug-button.vue';
  import { useFlow } from '../../../hooks/useFlow';
  import ParamsConfigButton from '../__comps__/params-config-button.vue';
  import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
  import { EnvTypeEnum } from '../../../enums';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const emit = defineEmits(['toggle-step']);
  const { appInfo } = useFlow();
  // 只有dev环境才有branchId
  const branchId = ref();
  const formRef = ref();
  const bsOptions = ref([]);
  const modelTypeTree = ref<{ type: string; list: any[] }[]>([]);
  const catetegoryType = ref('entity');

  const modelTypes = [
    {
      value: 'entity',
      label: $t('sys.model.entity'),
      preKey: 'em',
    },
    {
      value: 'form',
      label: $t('sys.pageDesigner.form'),
      preKey: 'fm',
    },
  ];

  const modelOptions = computed(() => {
    return modelTypeTree.value.find((e) => e.type === catetegoryType.value)?.list || [];
  });

  const formState = reactive<NodeBizDataSchema.ModelBs['nodeConfig']>(
    props.nodeData.bizData.nodeConfig,
  );

  const headers = computed(() => {
    return {
      'App-Tag': props.nodeData.bizData.nodeConfig?.appTag,
      // 'tenant-id': userStore.getTenant,
      Env: appInfo.value.appTag ? appInfo.value.env : formState.env,
    };
  });

  // 切换应用时更新模型列表
  watch(
    () => props.nodeData.bizData?.nodeConfig?.appTag,
    async () => {
      if (props.nodeData.bizData?.nodeConfig) {
        // eslint-disable-next-line vue/no-mutating-props
        props.nodeData.bizData.nodeConfig['branchId'] = branchId.value ?? appInfo.value.branchId;
        // eslint-disable-next-line vue/no-mutating-props
        // props.nodeData.bizData.nodeConfig['env'] = appInfo.value.appTag ? appInfo.value.env : 'dev';
        // eslint-disable-next-line vue/no-mutating-props
        props.nodeData.bizData.nodeConfig['tenantId'] = appInfo.value.tenantId;
      }
      if (!appInfo.value.appTag && props.nodeData.bizData.nodeConfig['env'] === 'dev') {
        await getAppBranch();
      }
      setTimeout(async () => {
        await getModelList();
      });
    },
    {
      immediate: true,
    },
  );

  // 切换模型时，更新业务服务列表
  watch(
    () => props.nodeData.bizData?.nodeConfig?.modelKey,
    (val) => {
      val && getBSData(val);
    },
  );

  onMounted(() => {
    branchId.value = appInfo.value.branchId;
    const { modelCategory, modelKey } = props.nodeData.bizData.nodeConfig;
    catetegoryType.value = modelKey?.split('_')[0]?.includes('fm')
      ? 'form'
      : modelCategory || 'entity';
  });

  const getModelList = async () => {
    const res: any[] =
      (await getModelMetaFindAllByTypeIn(
        { type: 'BASE,NDO,RDO' },
        {
          transferToConfig: {
            headers: {
              ...headers.value,
              'Branch-Id': branchId.value,
            },
          },
        },
      )) || [];
    if (formState.modelKey) getBSData(formState.modelKey);
    modelTypeTree.value = modelTypes.reduce((list: any[], item: any) => {
      list.push({
        type: item.value,
        list: res.filter((e) => e.key?.split('_')[0]?.includes(item.preKey)),
      });
      return list;
    }, []);
  };

  const getBSData = async (modelKey) => {
    const res: any = await getBizServiceCrudList(
      { modelKey },
      {
        transferToConfig: {
          headers: {
            ...headers.value,
            'Branch-Id': branchId.value,
          },
        },
      },
    );
    bsOptions.value =
      res?.map((e) => {
        return {
          label: `${e.name}[${e.key}]`,
          value: e.key,
        };
      }) || [];
  };

  const handleCategoryChange = (val) => {
    if (props.nodeData.bizData.nodeConfig) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig['modelCategory'] = val === 'form' ? 'entity' : val;
    }
    formState.modelKey = '';
    formState.bsKey = '';
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
        title: '参数配置',
        width: 800,
        okText: $t('sys.okText'),
      },
    );
    if (res.ok) {
      Object.assign(formState, res.params || {});
    }
  };

  // 获取应用的分支id
  async function getAppBranch() {
    branchId.value = '';
    if (formState.env !== 'dev') return;
    const res = await getAppBranchList({
      transferToConfig: {
        skipBranchId: true,
        ...{ headers: headers.value },
      },
    });
    if (!branchId.value) {
      branchId.value = (res ?? []).find((item) => item.head === 1)?.id;
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig['branchId'] = branchId.value ?? appInfo.value.branchId;
    }
  }

  const hanleEnvChange = async (val) => {
    formState.modelKey = undefined;
    formState.bsKey = undefined;
    await getAppBranch();
    getModelList();
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
