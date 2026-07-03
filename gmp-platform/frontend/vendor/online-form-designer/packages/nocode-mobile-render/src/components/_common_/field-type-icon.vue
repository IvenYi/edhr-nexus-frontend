<template>
  <span class="field-type-icon">
    <i :class="['iconfont', fieldIcon || 'icon-zidingyi']"></i>
  </span>
</template>

<script setup lang="ts" name="field-wrapper">
  import { computed } from 'vue';
  import { FIELD_TYPE, FieldIconMap } from '/@/enums/appEnum';

  const props = defineProps<{
    type: FIELD_TYPE;
  }>();

  const fieldIcon = computed(() => {
    if (props.type === FIELD_TYPE.SIGNATURE) {
      return 'icon-dianziqianmingdd';
    }
    return FieldIconMap[props.type] || FieldIconMap[FIELD_TYPE.TEXT];
  });
</script>

<style scoped lang="less">
  .field-type-icon {
    color: #797a7d;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    i {
      font-size: 16px;
      line-height: 1;
    }
  }
</style>
