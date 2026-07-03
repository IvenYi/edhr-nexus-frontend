<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.edhr.txnConfig')">
      <form-item
        label="事务"
        :inline="false"
        is-first
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select
          v-model:value="formState.transactionId"
          :placeholder="t('sys.chooseText')"
          :options="optionsData"
          :disabled="paasBpmnReadonly"
          dropdown-class-name="gct-project-select-dropdown"
          showArrow
          allowClear
          showSearch
          optionFilterProp="name_"
          :fieldNames="{ label: 'name_', value: 'id_' }"
          size="small"
        />
      </form-item>
      <form-item
        :label="t('sys.edhr.interactiveMode')"
        :inline="false"
        :tooltip="t('sys.edhr.interactiveModeTips')"
      >
        <a-radio-group
          v-model:value="formState.interactiveMode"
          size="small"
          :disabled="paasBpmnReadonly"
        >
          <a-radio value="sync">
            {{ t('sys.ipaas.responseMethod.SYNC') }}
          </a-radio>
          <a-radio value="async">
            {{ t('sys.ipaas.responseMethod.ASYNC') }}
          </a-radio>
        </a-radio-group>
      </form-item>
      <!-- <form-item label="自定义事务单据" :inline="false">
        <a-switch v-model:checked="formState.userDefined" size="small" />
      </form-item>
      <form-item
        v-if="formState.userDefined"
        label="事务单据"
        :inline="false"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select
          v-model:value="formState.txnDocId"
          :placeholder="t('sys.chooseText')"
          :options="optionsData"
          :disabled="paasBpmnReadonly"
          dropdown-class-name="gct-project-select-dropdown"
          showArrow
          allowClear
          :fieldNames="{ label: 'fieldLabel', value: 'refId' }"
          size="small"
        />
      </form-item> -->
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import formItem from '../../components/form-item.vue';
  import { computed, inject, onMounted, provide, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  // import { BizFlowModule } from '@gct/flow/src/plugins/biz-bpmn/enums';
  import { useGctBizBpmn } from '@gct/flow/src/plugins/biz-bpmn';

  const props = defineProps<{
    node: GctBpmnNode.BpmnForm;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);
  const { t } = useI18n();

  const { deleteNodeById, addTransNextNode } = useGctBizBpmn();

  const formState: any = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const optionsData = ref([]);

  onMounted(async () => {
    if (!props.node.data!.interactiveMode) {
      props.node.data!.interactiveMode = 'sync';
    }
    getOptions();
  });

  async function getOptions() {
    const query: any = {};
    query['operating_state_.eq'] = true;
    query['attr_.ne'] = 'system';
    // switch (props.node.data?.txnModule) {
    //   case BizFlowModule.Stock:
    //     query.txn_module_ = 'STOCK';
    //     break;
    //   case BizFlowModule.Inspection:
    //     query.txn_module_ = 'INSPECTION';
    //     break;
    //   case BizFlowModule.Release:
    //     query.txn_module_ = 'RELEASE';
    //     break;
    //   case BizFlowModule.Edhr:
    //     query.txn_module_ = 'PRODUCTION';
    //     break;
    // }
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_txn_definition',
        modelCategory: 'entity',
      },
      {},
      {
        query,
        sorts: [{ sortField: 'create_time_', sortType: 'desc' }],
      },
    );
    optionsData.value = res?.data || [];
  }

  watch(
    () => props.node.data!.interactiveMode,
    (val) => {
      if (val === 'async') {
        const nextKey = formState.value.nextKey;
        formState.value.nextKey = '';
        deleteNodeById(nextKey);
      } else if (val === 'sync' && !formState.value.nextKey) {
        addTransNextNode(props.node);
      }
    },
  );
</script>
<style lang="less" scoped>
  :deep(.ant-radio-wrapper) {
    font-size: 12px !important;
  }
</style>
