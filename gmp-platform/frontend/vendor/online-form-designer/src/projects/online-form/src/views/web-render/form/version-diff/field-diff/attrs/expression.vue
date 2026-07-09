<template>
  <AttrItem
    :label="$t('sys.pageDesigner.fieldCmp.expression')"
    :new-val="getValue(data?.new)"
    :old-val="getValue(data?.old)"
    :is-update="!!data?.value?.old"
  />
</template>
<script setup lang="ts">
  import AttrItem from './attrItem.vue';

  defineProps<{
    data: any;
  }>();

  function getValue(data) {
    if (!data) return '';
    const { exprEcho } = data;
    return exprEcho || '--';
  }
</script>
<style lang="less" scoped></style>
