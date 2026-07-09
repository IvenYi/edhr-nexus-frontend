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
        :options="filterShowOptions"
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
    </template>
    <template v-else-if="bindCompStyleType === BindCmpStyleEnum.CMP_SELECT_LIST">
      <base-cell-comp-field
        v-model:value="value"
        show-suffix-icon
        :show-disabled="showDisabled"
        :real-field-id="realFieldId"
        :placeholder="placeholder"
        :multiple="multiple"
        :callback="readonlyCallback"
      >
        <template #suffixIcon>
          <i class="iconfont icon-pad_arrow_down text-14px" />
        </template>
      </base-cell-comp-field>
    </template>

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

<script setup lang="ts" name="online-form-enum-select-render">
  import { computed, reactive, watch } from 'vue';
  import { has, isEmpty, isNil } from 'lodash-es';
  import { FIELD_TYPE } from '@gct/runtime';
  import {
    renderUtils,
    useWidgetStaticAttrs,
    PlatformEnum,
    BindCmpStyleEnum,
    useNocodeFormWidget,
    type IEnumSelect,
  } from '@gct/nocode-base';
  import WidgetComponent from '../../_common_/widget-component.vue';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import CheckboxCellCompField from '../../_common_/base-cell-comp-field/checkbox-cell-comp-field.vue';
  import RadioCellCompField from '../../_common_/base-cell-comp-field/radio-cell-comp-field.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';

  const cmp = {
    [BindCmpStyleEnum.CMP_CHECKBOX]: CheckboxCellCompField,
    [BindCmpStyleEnum.CMP_RADIO]: RadioCellCompField,
  };

  const props = defineProps<{
    modelValue?: any;
    widget: IEnumSelect;
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

  const {
    field,
    fieldType,
    bindCompStyleType,
    showDisabled,
    placeholder,
    options,
    dataRelationShip,
  } = useWidgetStaticAttrs(props.widget);

  const { labelPos, direction, letterSpace } = reactive(props.widget.props);

  const multiple = fieldType === FIELD_TYPE.ENUM_MULTI || fieldType === FIELD_TYPE.OPTION_MULTI;

  const filterShowOptions = computed(() => {
    return options.filter((item) => {
      if (has(item, 'display')) {
        return item.display;
      }
      return true;
    });
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
</script>
