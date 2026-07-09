<template>
  <AttrItem
    :label="$t('sys.webRender.DiffedAttrMaps.lowerLimit')"
    :old-val="getValue(data?.value?.old)"
    :new-val="getValue(data?.value?.new)"
    :is-update="!!data?.value?.old"
  />
</template>
<script setup lang="ts">
  import { RangeValidateMode } from '@gct/nocode-base';
  import AttrItem from './attrItem.vue';

  defineProps<{
    data: any;
  }>();

  function getValue(data) {
    const { minValidateMode, min, minExprEcho } = data || {};
    const str = minValidateMode
      ? $t(`sys.onlineForm.NumberRangeValidateMode.${minValidateMode}`)
      : '--';
    if (minValidateMode === RangeValidateMode.Fixed_Number) {
      return `${str}【${min}】`;
    }
    if (minValidateMode === RangeValidateMode.Variable_Validate) {
      return `${str}【${minExprEcho}】`;
    }
    return str;
  }
</script>
<style lang="less" scoped></style>
