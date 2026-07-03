<template>
  <div class="rounded-8px overflow-hidden py16px">
    <div class="ks-row">
      <div class="item-label" :title="$t('sys.edhr.materialStatus.TXN')">{{
        $t('sys.edhr.materialStatus.TXN')
      }}</div>
      ：
      <div class="ks-col item-value">{{ txnName }}</div>
    </div>
    <div class="ks-row">
      <div class="item-label" :title="$t('sys.status')">{{ $t('sys.status') }}</div>
      ：
      <div
        class="ks-col"
        :style="{
          color: iconExtraProps[data.childTxnInstStatus]?.textColor,
        }"
      >
        {{ iconExtraProps[data.childTxnInstStatus]?.label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, watch, ref, onMounted } from 'vue';
  import type { IGctBpmnNode } from '../../types';
  import { useGctFlow } from '@gct/flow/src/hooks/useGctFlow';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getEnumModelInfoById } from '/@/apis/gct-apaas/EnumModelController';

  const props = defineProps<{
    node: IGctBpmnNode;
    width?: number;
  }>();

  const { nodeInstStatusMap } = useGctFlow();

  const nodeInst = computed(() => {
    const inst = nodeInstStatusMap.value[props.node.id]?.data;
    console.log('nodeInst', inst, props.node);
    return inst;
  });

  const txnName = ref('');
  const iconExtraProps = ref({});
  const getTxnName = async (id: string) => {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_txn_definition',
        bsKey: 'getById',
        modelCategory: 'entity',
      },
      { id },
    );
    txnName.value = res?.data?.name_;
  };

  watch(
    () => nodeInst.value?.txnDefinitionId,
    (val) => {
      if (val) getTxnName(val);
      txnName.value = '';
    },
    { immediate: true },
  );

  async function getEnumConfig({ id }) {
    const res: any = (await getEnumModelInfoById({ id })) || {};
    return res;
  }

  async function getTransStatus() {
    const res = await getEnumModelFieldPageList({
      enumModelId: 'enu_txn_inst_status',
      enumModelKey: 'enu_txn_inst_status',
    });
    const config = (await getEnumConfig({ id: 'enu_txn_inst_status' })) || {};
    iconExtraProps.value = res?.data?.reduce((obj, e) => {
      obj[e.value] = {
        label: e.text,
        icon: e.iconState ? e.icon : null,
        iconColor: config.iconState ? e.iconColor : null,
        textColor: config.textState ? e.textColor : null,
      };
      return obj;
    }, {});
    console.log(iconExtraProps.value);
  }

  onMounted(() => {
    getTransStatus();
  });
</script>
