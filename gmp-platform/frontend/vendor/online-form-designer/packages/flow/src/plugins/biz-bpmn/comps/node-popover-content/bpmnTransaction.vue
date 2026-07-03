<template>
  <div class="text-[#212528] px16px">
    <div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.materialStatus.TXN') }}</div>
        ：
        <div class="ks-col">{{ txnName }}</div>
      </div>
      <div class="ks-row">
        <div>{{ $t('sys.status') }}</div>
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
  </div>
</template>
<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { getEnumModelFieldPageList } from '../../../../../../../src/apis/gct-apaas/EnumModelFieldController';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getEnumModelInfoById } from '/@/apis/gct-apaas/EnumModelController';

  const props = defineProps<{
    data: any;
  }>();

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
    () => props.data?.txnDefinitionId,
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
      const i18n = JSON.parse(e.i18nConfig || '{}');
      obj[e.value] = {
        label: $t(i18n?.text || e.text),
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
<style lang="less" scoped></style>
