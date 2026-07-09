<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <form-item :label="t('sys.appDesigner.approval.nodeKey')" :inline="false" is-first>
        {{ formState!.key }}
      </form-item>
      <form-item
        :label="t('sys.appDesigner.approval.nodeName')"
        name="name"
        :inline="false"
        :rules="[
          {
            required: true,
            message: t('sys.notEmptySth', { sth: t('sys.appDesigner.approval.nodeName') }),
          },
        ]"
      >
        <a-input
          v-model:value="formState!.name"
          size="small"
          :maxlength="32"
          show-count
          :disabled="bpmnReadonly"
        />
      </form-item>
      <form-item :label="t('sys.appDesigner.approval.nodeDesc')" :inline="false" name="description">
        <a-textarea
          v-model:value="formState!.description"
          size="small"
          :maxlength="120"
          show-count
          :disabled="bpmnReadonly"
        />
      </form-item>
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.edhr.txnConfig')">
      <form-item
        :label="$t('sys.edhr.transaction')"
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
          :disabled="bpmnReadonly"
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
          :disabled="bpmnReadonly"
        >
          <a-radio value="sync">
            {{ t('sys.ipaas.responseMethod.SYNC') }}
          </a-radio>
          <a-radio value="async">
            {{ t('sys.ipaas.responseMethod.ASYNC') }}
          </a-radio>
        </a-radio-group>
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import { computed, inject, onMounted, provide, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { useGctBpmn } from '@gct/flow/src/plugins/bpmn/hooks/useGctBpmn';

  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import FormItem from '../../comps/form-item.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnTransaction;
  }>();

  const bpmnReadonly = inject('bpmnReadonly', false);
  provide('bpmnReadonly', bpmnReadonly);

  const { t } = useI18n();

  const { deleteNodeById, addTransNextNode } = useGctBpmn();

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
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_txn_definition',
        modelCategory: 'entity',
      },
      {},
      {
        // @ts-ignore
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
