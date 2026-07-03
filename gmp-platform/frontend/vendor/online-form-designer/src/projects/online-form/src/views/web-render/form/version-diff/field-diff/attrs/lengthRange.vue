<template>
  <AttrItem
    :label="$t('sys.component.fieldTypeProps.textLengthRange')"
    :new-val="getValue(data?.value?.new)"
    :old-val="getValue(data?.value?.old)"
    :is-update="!!data?.value?.old"
  />
</template>
<script setup lang="ts">
  import AttrItem from './attrItem.vue';

  defineProps<{
    data: any;
  }>();

  const isEmpty = (val) => {
    return val == '' || val == null || val == undefined;
  };

  function getValue(data) {
    if (!data) return '';
    const { minlength, maxlength } = data;
    if (isEmpty(minlength) && isEmpty(maxlength)) return '--';
    return `${isEmpty(minlength) ? '--' : minlength} - ${isEmpty(maxlength) ? '--' : maxlength}`;
  }
</script>
<style lang="less" scoped></style>
