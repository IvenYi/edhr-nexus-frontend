<template>
  <div class="combine-fields-area">
    <WidgetComponent
      v-for="fieldWidget in fields"
      :key="fieldWidget.id"
      :widget="fieldWidget"
      :formData="formData"
      :subtableFieldId="subtableFieldId"
      :realRowIndex="realRowIndex"
      :pageRowIndex="pageRowIndex"
      :childSubTableDataIndex="childSubTableDataIndex"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-combine-fields-render">
  import { reactive } from 'vue';
  import WidgetComponent from '/@online-form/views/render/__components__/_common_/widget-component.vue';

  import type { ICombineFields } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: ICombineFields;
    formData: Object;
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

  const { fields } = reactive(props.widget.props);
</script>

<style scoped lang="less"></style>
