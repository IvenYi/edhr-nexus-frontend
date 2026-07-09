<template>
  <div>
    <!-- {{ nodeData }} -->
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-form-item :label="$t('sys.ipaas.dataSourceSelect')" name="dsKey" :rules="[{ required: true }]">
        <div class="ks-row">
          <div class="ks-col overflow-hidden">
            <a-select
              v-model:value="formState.dsKey"
              size="small"
              :disabled="readonly"
              showSearch
              optionFilterProp="name"
              :options="dataSourceOptions"
              :fieldNames="{ label: 'name', value: 'key' }"
              @change="handleSourceChange"
            />
          </div>
          <div v-show="dsType" class="w90px text-right" style="flex-shrink: 0">
            {{ $t(`sys.component.dataConnection.db.${dsType}`) }}
          </div>
        </div>
      </a-form-item>
      <a-form-item :label="$t('sys.ipaas.envSelect')" name="env" :rules="[{ required: true }]">
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
      <a-form-item :label="$t('sys.ipaas.executeSql')" name="sql" :rules="[{ required: true }]">
        <a-textarea
          v-model:value="formState.sql"
          :placeholder="$t('sys.inputText')"
          :rows="4"
          :disabled="readonly"
        />
      </a-form-item>
      <div class="ks-row text-12px text-[#c3c3c3] mt8px">
        <i class="iconfont icon-jinggao1 error-gct mr4px text-14px"></i>
        {{ $t('sys.ipaas.executeSqlTip') }}
      </div>

      <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" />
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import type { GctFlowNode } from '@gct/flow';
  import DebugButton from '../__comps__/debug-button.vue';
  import { EnvTypeEnum } from '../../../enums';
  import { getDataSourceList } from '/@/apis/gct-platform/DataSourceController';
  import { DataSourceMainResponse } from '../../../../../../apis/gct-platform/model';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const userStore = useUserStoreWithOut();
  const formRef = ref();
  const dataSourceOptions = ref<Array<DataSourceMainResponse>>([]);

  const formState = reactive<NodeBizDataSchema.DB['nodeConfig']>(props.nodeData.bizData.nodeConfig);

  const dsType = computed(() => {
    return formState.dsKey
      ? dataSourceOptions.value?.find((e) => e.key === formState.dsKey)?.type
      : '';
  });

  onMounted(() => {
    formState.tenantId = userStore.getTenant;
    getDataSource();
  });

  const hanleEnvChange = async (val) => {};

  const getDataSource = async () => {
    const res: any = await getDataSourceList();
    dataSourceOptions.value = res ?? [];
  };

  const handleSourceChange = (value, option) => {
    formState.dsId = option.id;
    formState.env = EnvTypeEnum.dev;
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
