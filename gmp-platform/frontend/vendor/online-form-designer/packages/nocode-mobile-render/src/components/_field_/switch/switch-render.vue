<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <template
      v-if="
        bindCompStyleType === BindCmpStyleEnum.CMP_CHECKBOX ||
        bindCompStyleType === BindCmpStyleEnum.CMP_RADIO
      "
    >
      <component
        :is="cmp[bindCompStyleType]"
        v-model:value="value"
        :class="[direction, `text-pos-${labelPos}`]"
        :style="{ '--space': !isNil(letterSpace) ? `${letterSpace}px` : 0 }"
        :field-type="fieldType"
        :show-disabled="showDisabled"
        :real-field-id="realFieldId"
        :options="cmpOptions"
      >
        <template #introduceField="{ refFields }">
          <widget-component
            v-for="fieldWidget in refFields"
            :key="fieldWidget.id"
            :widget="fieldWidget"
            :formData="formData"
            :subtableFieldId="subtableFieldId"
            :realRowIndex="realRowIndex"
            :pageRowIndex="pageRowIndex"
            :childSubTableDataIndex="childSubTableDataIndex"
          />
        </template>
      </component>
    </template>
    <template v-else-if="bindCompStyleType === BindCmpStyleEnum.CMP_SELECT_LIST">
      <base-cell-comp-field
        v-model:value="value"
        show-suffix-icon
        :show-disabled="showDisabled"
        :real-field-id="realFieldId"
        :placeholder="placeholder"
        :callback="readonlyCallback"
      >
        <template #suffixIcon>
          <i class="iconfont icon-pad_arrow_down text-14px" />
        </template>
      </base-cell-comp-field>
    </template>

    <template #readonlyIntroduce>
      <widget-component
        v-for="fieldWidget in renderIntroduce"
        :key="fieldWidget.id"
        :widget="fieldWidget"
        :formData="formData"
        :subtableFieldId="subtableFieldId"
        :realRowIndex="realRowIndex"
        :pageRowIndex="pageRowIndex"
        :childSubTableDataIndex="childSubTableDataIndex"
      />
    </template>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-switch-render">
  import { computed, reactive, ref, watch } from 'vue';
  import { isNil } from 'lodash-es';
  import {
    useNocodeFormWidget,
    renderUtils,
    useWidgetStaticAttrs,
    BindCmpStyleEnum,
    BooleanShowMode,
    type ISwitch,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import WidgetComponent from '../../_common_/widget-component.vue';
  import CheckboxCellCompField from '../../_common_/base-cell-comp-field/checkbox-cell-comp-field.vue';
  import RadioCellCompField from '../../_common_/base-cell-comp-field/radio-cell-comp-field.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';

  const cmp = {
    [BindCmpStyleEnum.CMP_CHECKBOX]: CheckboxCellCompField,
    [BindCmpStyleEnum.CMP_RADIO]: RadioCellCompField,
  };

  const props = defineProps<{
    modelValue?: string;
    widget: ISwitch;
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

  const { realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { field, fieldType, bindCompStyleType, placeholder, showDisabled, options } =
    useWidgetStaticAttrs(props.widget);

  const { labelPos, displayMode, direction, letterSpace } = reactive(props.widget.props);

  const renderIntroduce = ref();

  const cmpOptions = computed(() => {
    if (bindCompStyleType === BindCmpStyleEnum.CMP_SELECT_LIST) {
      return options;
    }
    switch (displayMode) {
      case BooleanShowMode.Both:
        return options;
      case BooleanShowMode.OnlyTrue:
        return options.filter((item: any) => item.value);
      case BooleanShowMode.OnlyFalse:
        return options.filter((item: any) => !item.value);
      default:
        return options;
    }
  });

  const value = computed({
    get() {
      return renderUtils.getBoolValue(props.modelValue);
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  watch(
    () => props.modelValue,
    () => {
      if (!isNil(props.modelValue)) {
        const newLb = getOptionLabel(props.modelValue);
        const oldLb = props.formData[`${field}_lb_`];
        if (oldLb !== newLb) {
          props.formData[`${field}_lb_`] = newLb;
        }
      } else {
        props.formData[`${field}_lb_`] = null;
      }
    },
    {
      immediate: true,
    },
  );

  function readonlyCallback(val) {
    const result = options.find((item) => item.value === renderUtils.getBoolValue(val));

    if (result && result.refFields) {
      renderIntroduce.value = result.refFields;
    }
    return renderUtils.getLabJsonValue(props.formData, field);
  }

  function getOptionLabel(val) {
    const result = options.find((item) => item.value === renderUtils.getBoolValue(val));

    return result?.label ?? '';
  }
</script>
