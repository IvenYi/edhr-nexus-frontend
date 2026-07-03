<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <Select
      :class="['userpicker-select', showRequired && 'is-show-required', realFieldId]"
      v-model:value="value"
      :disabled="showDisabled"
      v-bind="separatorAttr"
      @change="onChange(getOptionLabel)"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-userpicker-render">
  import { computed, watch } from 'vue';
  import { isNil } from 'lodash-es';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { Select } from 'ant-design-vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  import {
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    PlatformEnum,
  } from '@gct/nocode-base';
  import type { IUserpicker } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IUserpicker;
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

  const { onChange, isDynValue, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);
  console.log('props', props);

  const { placeholder, fieldType, field, showRequired, showDisabled, options, dataRelationShip } =
    useWidgetStaticAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.USER_MULTI;

  const separatorAttr = computed(() => {
    let attr = {
      placeholder,
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
      showSearch: true,
      maxTagCount: 'responsive',
      maxTagTextLength: 2,
      options,
      filterOption,
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
            key: 'label',
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

  const filterOption = (input, option) => {
    const item = option._item || {};
    const searchStr = input.toLowerCase();
    return (
      (item.fullname && item.fullname.toLowerCase().includes(searchStr)) ||
      (item.username && item.username.toLowerCase().includes(searchStr)) ||
      (item.empNo && String(item.empNo).toLowerCase().includes(searchStr))
    );
  };

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
      return renderUtils.getSelectOptions({
        value: val,
        multiple,
        options,
        key: 'label',
      }).labelJson;
    }
  }
</script>

<style scoped lang="less">
  :deep(.ant-select.userpicker-select) {
    width: var(--cmp-width, 100%);
    min-width: 30px;
    vertical-align: middle;
    .ant-select-selector {
      height: 28px;
      padding: 0 2px;
      border-radius: 2px;

      border-color: var(--required-border-color, #e9e9e9);
      background-color: var(--required-background-color, transparent);
      &:hover {
        border-color: var(--required-border-hover-color, var(--ant-primary-color));
      }

      .ant-select-selection-search {
        left: 2px;
        right: 16px;
        > input {
          height: 28px;
        }
      }
      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 26px;
        padding-right: 12px;
        font-size: var(--size, 12px);
        text-align: left;
      }
    }
    .ant-select-arrow {
      right: 4px;
    }
    .ant-select-clear {
      right: 4px;
    }

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }

    &.ant-select-multiple {
      .ant-select-selection-item {
        line-height: 22px;
        padding-right: 4px;
        margin-top: -1px;
        margin-bottom: 1px;
      }
      .ant-select-selection-search {
        margin-inline-start: 0;
      }
      .ant-select-selection-placeholder {
        left: 2px;
      }
    }
  }
</style>
