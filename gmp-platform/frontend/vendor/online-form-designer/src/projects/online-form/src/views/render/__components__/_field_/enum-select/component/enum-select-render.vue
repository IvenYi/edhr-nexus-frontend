<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
    class="enum-select-render"
  >
    <component
      :is="cmp[bindCompStyleType]"
      v-bind="separatorAttr"
      v-model:value="value"
      v-model:checked="value"
      @change="onChange(getOptionLabel)"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
      :isAutoLineBreak="isAutoLineBreak"
    >
      <template #introduceField="{ refFields, optionValue }">
        <widget-component
          v-for="fieldWidget in refFields"
          :key="fieldWidget.id"
          :widget="fieldWidget"
          :formData="formData"
          :subtableFieldId="subtableFieldId"
          :realRowIndex="realRowIndex"
          :pageRowIndex="pageRowIndex"
          :childSubTableDataIndex="childSubTableDataIndex"
          :referenceInfo="{ belongFieldId: field, optionValue, multiple }"
        />
      </template>
    </component>

    <template #readonlyIntroduce>
      <template v-for="fields in renderIntroduce">
        <widget-component
          v-for="fieldWidget in fields"
          :key="fieldWidget.id"
          :widget="fieldWidget"
          :formData="formData"
          :subtableFieldId="subtableFieldId"
          :realRowIndex="realRowIndex"
          :pageRowIndex="pageRowIndex"
          :childSubTableDataIndex="childSubTableDataIndex"
        />
      </template>
    </template>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-switch-render">
  import { reactive, computed, watch } from 'vue';
  import { isEmpty, isNil, has } from 'lodash-es';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import WidgetComponent from '/@online-form/views/render/__components__/_common_/widget-component.vue';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import {
    BindCmpStyleEnum,
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    PlatformEnum,
  } from '@gct/nocode-base';
  import CheckboxSwitch from './checkbox-enum.vue';
  import RadioSwitch from './radio-enum.vue';
  import SelectSwitch from './select-enum.vue';
  import type { IEnumSelect } from '@gct/nocode-base';

  const cmp = {
    [BindCmpStyleEnum.CMP_CHECKBOX]: CheckboxSwitch,
    [BindCmpStyleEnum.CMP_RADIO]: RadioSwitch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: SelectSwitch,
  };

  const props = defineProps<{
    modelValue?: any;
    widget: IEnumSelect;
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

  const { labelPos, direction, letterSpace } = reactive(props.widget.props);

  const {
    field,
    fieldType,
    bindCompStyleType,
    showRequired,
    showDisabled,
    placeholder,
    options,
    dataRelationShip,
    isAutoLineBreak,
  } = useWidgetStaticAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.ENUM_MULTI || fieldType === FIELD_TYPE.OPTION_MULTI;

  const filterShowOptions = computed(() => {
    return options.filter((item) => {
      if (has(item, 'display')) {
        return item.display;
      }
      return true;
    });
  });

  const separatorAttr = computed(() => {
    const cmpStyle = {};
    const cmpClass: string[] = [
      direction,
      `text-pos-${labelPos}`,
      showRequired.value && 'is-show-required',
      realFieldId.value,
    ];
    if (!isNil(letterSpace)) {
      Object.assign(cmpStyle, {
        '--space': `${letterSpace}px`,
      });
    }

    let attr = {
      placeholder,
      disabled: showDisabled.value,
      options: filterShowOptions.value,
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
      maxTagCount: 'responsive',
      maxTagTextLength: 2,
      class: cmpClass,
      style: cmpStyle,
    };
    return attr;
  });

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, multiple));
    },
  });

  watch(
    () => props.modelValue,
    () => {
      if (!isNil(props.modelValue)) {
        const newLb = JSON.stringify(
          renderUtils.getSelectOptions({
            value: props.modelValue,
            multiple,
            options,
            key: 'text',
          }).labels,
        );
        const oldLb = props.formData[`${field}_lb_`];
        if (oldLb !== newLb) {
          props.formData[`${field}_lb_`] = newLb;
        }
      }
    },
    {
      immediate: true,
    },
  );

  const renderIntroduce = computed(() => {
    return renderUtils.getSelectOptions({
      value: props.formData?.[field!] || props.modelValue,
      multiple,
      options,
      key: 'refFields',
    }).labels;
  });

  function readonlyCallback(val) {
    if (val) {
      if (dataRelationShip?.platformType === PlatformEnum.INTEGRATION_PAAS_DP) {
        return val;
      }

      return renderUtils.getLabJsonValue(props.formData, field);
    }
  }

  function getOptionLabel(val) {
    if (val) {
      const res = renderUtils.getSelectOptions({
        value: val,
        multiple,
        options,
        key: 'text',
      });

      return isEmpty(res.selectOptions) ? val : res.labelJson;
    }
  }
</script>

<style lang="less" scoped>
  .enum-select-render {
    width: var(--cmp-width, 100%);
  }
</style>
