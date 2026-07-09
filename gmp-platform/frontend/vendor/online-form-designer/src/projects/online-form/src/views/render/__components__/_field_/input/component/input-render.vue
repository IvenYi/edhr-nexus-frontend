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
      @focus="$attrs.onFocus"
      @pressEnter="onPressEnter"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-input-render">
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import CellInput from './cell-input.vue';
  import CellSelect from './cell-select.vue';
  import CellTextarea from '../../textarea/component/cell-textarea.vue';
  import { BindCmpStyleEnum, useWidgetStaticAttrs, useNocodeFormWidget } from '@gct/nocode-base';

  import type { IInput } from '@gct/nocode-base';

  const cmp = {
    [BindCmpStyleEnum.CMP_TEXT]: CellInput,
    [BindCmpStyleEnum.CMP_TEXTAREA]: CellTextarea,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: CellSelect,
  };

  const props = defineProps<{
    modelValue?: string;
    widget: IInput;
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
