<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
    class="switch-render"
  >
    <component
      :is="cmp[bindCompStyleType]"
      v-bind="separatorAttr"
      v-model:value="value"
      v-model:checked="value"
      @change="onChange(getOptionLabel)"
      :isAutoLineBreak="isAutoLineBreak"
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
  import { reactive, ref, computed, watch } from 'vue';
  import WidgetComponent from '/@online-form/views/render/__components__/_common_/widget-component.vue';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import {
    BindCmpStyleEnum,
    BooleanShowMode,
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
  } from '@gct/nocode-base';
  import CheckboxSwitch from './checkbox-switch.vue';
  import RadioSwitch from './radio-switch.vue';
  import SelectSwitch from './select-switch.vue';
  import { isNil } from 'lodash-es';
  import type { ISwitch } from '@gct/nocode-base';

  const cmp = {
    [BindCmpStyleEnum.CMP_CHECKBOX]: CheckboxSwitch,
    [BindCmpStyleEnum.CMP_RADIO]: RadioSwitch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: SelectSwitch,
  };

  const props = defineProps<{
    modelValue?: any;
    widget: ISwitch;
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

  const { onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { labelPos, displayMode, direction, letterSpace, validateTrue, validateFalse } = reactive(
    props.widget.props,
  );

  const {
    field,
    fieldType,
    bindCompStyleType,
    placeholder,
    showRequired,
    showDisabled,
    options,
    isAutoLineBreak,
  } = useWidgetStaticAttrs(props.widget);

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

  const separatorAttr = computed(() => {
    const cmpStyle = {};
    const cmpClass: string[] = [
      direction,
      `text-pos-${labelPos}`,
      (showRequired.value || validateTrue || validateFalse) && 'is-show-required',
      realFieldId.value,
    ];
    if (!isNil(letterSpace)) {
      Object.assign(cmpStyle, {
        '--space': `${letterSpace}px`,
      });
    }

    return {
      placeholder,
      fieldType: fieldType,
      options: cmpOptions.value,
      disabled: showDisabled.value,
      class: cmpClass,
      style: cmpStyle,
    };
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

<style lang="less" scoped>
  .switch-render {
    width: var(--cmp-width, 100%);
  }
</style>
