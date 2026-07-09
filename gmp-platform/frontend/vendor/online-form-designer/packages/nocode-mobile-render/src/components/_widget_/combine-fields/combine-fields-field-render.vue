<template>
  <div class="combine-fields-area">
    <div class="combine-fields-item" v-for="fieldWidget in fields" :key="fieldWidget.id">
      <WidgetComponent
        :key="fieldWidget.id"
        :widget="fieldWidget"
        :formData="formData"
        :subtableFieldId="subtableFieldId"
        :realRowIndex="realRowIndex"
        :pageRowIndex="pageRowIndex"
        :childSubTableDataIndex="childSubTableDataIndex"
        :isField="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="online-form-combine-fields-field-render">
  import { reactive } from 'vue';
  import type { ICombineFields } from '@gct/nocode-base';
  import WidgetComponent from '../../_common_/widget-component.vue';

  const props = defineProps<{
    modelValue?: string;
    widget: ICombineFields;
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

  const { fields } = reactive(props.widget.props);
</script>
<style scoped lang="less">
  .combine-fields-area {
    .van-field {
      border-radius: 8px;
    }

    .combine-fields-item + .combine-fields-item {
      margin-top: 8px;
    }
  }
</style>
