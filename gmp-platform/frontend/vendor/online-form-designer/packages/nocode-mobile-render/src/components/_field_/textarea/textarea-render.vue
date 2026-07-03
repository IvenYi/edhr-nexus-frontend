<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
  >
    <base-cell-comp-field
      v-model:value="value"
      :class="{ 'is-height-auto': bindCompStyleType === BindCmpStyleEnum.CMP_TEXTAREA }"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      :placeholder="placeholder"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-textarea-render">
  import {
    BindCmpStyleEnum,
    useNocodeFormWidget,
    useWidgetStaticAttrs,
    type ITextarea,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';

  const props = defineProps<{
    modelValue?: string;
    widget: ITextarea;
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

  const { value, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { showDisabled, bindCompStyleType, placeholder } = useWidgetStaticAttrs(props.widget);
</script>

<style scoped></style>
