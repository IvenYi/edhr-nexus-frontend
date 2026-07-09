<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
  >
    <component
      :is="cmp[bindCompStyleType]"
      :widget="widget"
      v-model:value="value"
      :showDisabled="showDisabled"
      :showRequired="showRequired"
      :realFieldId="realFieldId"
      :placeholder="placeholder"
      @change="onChange"
      @blur="onBlur"
      @pressEnter="onPressEnter"
      @focus="$attrs.onFocus"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-textarea-render">
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import CellTextarea from './cell-textarea.vue';
  import CellInput from '../../input/component/cell-input.vue';
  import { BindCmpStyleEnum, useWidgetStaticAttrs, useNocodeFormWidget } from '@gct/nocode-base';
  import type { ITextarea } from '@gct/nocode-base';

  const cmp = {
    [BindCmpStyleEnum.CMP_TEXT]: CellInput,
    [BindCmpStyleEnum.CMP_TEXTAREA]: CellTextarea,
  };

  const props = defineProps<{
    modelValue?: string;
    widget: ITextarea;
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

  const { value, onChange, onBlur, onPressEnter, realFieldId, annotationInfo } =
    useNocodeFormWidget(props, emit);

  const { showRequired, showDisabled, bindCompStyleType, placeholder } = useWidgetStaticAttrs(
    props.widget,
  );
</script>

<style scoped></style>
