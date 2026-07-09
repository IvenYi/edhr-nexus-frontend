<template>
  <div class="text-[#212528] px16px">
    <div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.bizComp') }}</div>
        ：
        <div class="ks-col">{{ compName }}</div>
      </div>
      <div class="ks-row">
        <div>{{ $t('sys.edhr.visibleUser') }}</div>
        ：
        <div class="ks-col">{{ data.viewRangeName }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';

  const props = defineProps<{
    data: any;
    node: any;
  }>();

  const compName = ref('');

  const getCompName = async (id: string) => {
    const res = await getEnumModelFieldPageList({
      pageNo: 1,
      pageSize: 10000,
      enumModelKey: 'enu_txn_component',
    });
    compName.value = res?.data?.find((item) => item.value === id)?.text;
  };

  watch(
    [() => props.data?.componentKey, () => props.node?.data?.bizCompId],
    ([val1, val2]) => {
      if (val1 || val2) getCompName(val1 || val2);
      else compName.value = '';
    },
    {
      immediate: true,
    },
  );
</script>
<style lang="less" scoped></style>
