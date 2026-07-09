<template>
  <AttrItem
    :label="$t('sys.model.inputAttr')"
    :new-val="getValue(data?.value?.new)"
    :old-val="getValue(data?.value?.old)"
    :is-update="!!data?.value?.old"
  />
</template>
<script lang="ts" setup name="inputAttr">
  import AttrItem from './attrItem.vue';

  defineProps<{
    data: any;
  }>();

  function getValue(data) {
    if (!data) return '';
    const str = data?.required ? $t('sys.model.required') : '';
    const str2 = data?.disabled ? $t('sys.disabled') : '';
    return str || str2 || '--';
  }
</script>
<style lang="scss" scoped>
  .attr-self {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    padding: 8px 12px;
    background-color: #f6f8fa;
    border-radius: 4px;

    .attr-self-label {
      color: #8b8b8b;
    }
  }
</style>
