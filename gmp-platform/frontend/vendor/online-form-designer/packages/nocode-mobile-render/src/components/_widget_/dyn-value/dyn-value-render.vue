<template>
  <widget-component-visible v-if="widgetSchema" :widget="widgetSchema">
    <widget-component
      :widget="widgetSchema"
      :formData="formData"
      :subtableFieldId="subtableFieldId"
      :realRowIndex="realRowIndex"
      :pageRowIndex="pageRowIndex"
      :childSubTableDataIndex="childSubTableDataIndex"
    />
  </widget-component-visible>
</template>

<script setup lang="ts" name="online-form-dyn-value-render">
  import WidgetComponentVisible from '../../_common_/widget-component-visible.vue';
  import WidgetComponent from '../../_common_/widget-component.vue';
  import type { IDynValue } from '@gct/nocode-base';
  import { useDynValue } from './logic/use-dyn-value';

  const props = defineProps<{
    modelValue?: string;
    widget: IDynValue;
    formData: any;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { widgetSchema } = useDynValue(props);
</script>

<style scoped lang="less"></style>
