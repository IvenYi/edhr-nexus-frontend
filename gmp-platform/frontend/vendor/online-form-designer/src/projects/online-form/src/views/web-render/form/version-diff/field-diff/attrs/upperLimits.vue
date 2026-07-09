<template>
  <AttrItem
    :label="$t('sys.webRender.DiffedAttrMaps.upperLimit')"
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
    const { maxValidateMode, max, maxExprEcho } = data || {};
    const str = maxValidateMode
      ? $t(`sys.onlineForm.NumberRangeValidateMode.${maxValidateMode}`)
      : '--';
    if (maxValidateMode === RangeValidateMode.Fixed_Number) {
      return `${str}【${max}】`;
    }
    if (maxValidateMode === RangeValidateMode.Variable_Validate) {
      return `${str}【${maxExprEcho}】`;
    }
    return str;
  }
</script>
<style lang="less" scoped></style>
