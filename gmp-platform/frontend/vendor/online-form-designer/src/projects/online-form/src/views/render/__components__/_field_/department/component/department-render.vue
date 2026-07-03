<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <a-tree-select
      :class="['department-select', showRequired && 'is-show-required', realFieldId]"
      show-search
      v-model:value="value"
      :tree-data="treeoptions"
      :placeholder="placeholder"
      :disabled="showDisabled"
      :multiple="multiple"
      allow-clear
      :show-checked-strategy="TreeSelect.SHOW_ALL"
      :tree-checkable="multiple"
      :tree-check-strictly="multiple"
      max-tag-count="responsive"
      :max-tag-text-length="2"
      :dropdown-match-select-width="false"
      tree-node-filter-prop="label"
      tree-node-label-prop="label"
      tree-default-expand-all
      @change="onChange(getOptionLabel)"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-department-render">
  import { computed, reactive, inject, watch } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { cloneDeep, isNil } from 'lodash-es';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { list_to_tree } from '/@/utils/helper/treeHelper';

  import { FIELD_TYPE } from '/@/enums/appEnum';
  import {
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    PlatformEnum,
  } from '@gct/nocode-base';
  import type { IDepartment } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IDepartment;
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

  const { field, fieldType, showRequired, showDisabled, placeholder, options, dataRelationShip } =
    useWidgetStaticAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.ORG_MULTI;

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, multiple, 'value'));
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

  function deepDepts(trees, parentLabel?: string) {
    trees.forEach((i) => {
      const ch_full_path = parentLabel ? `${parentLabel}/${i.title}` : i.title;
      i.label = ch_full_path;
      if (i?.children?.length) {
        deepDepts(i.children, ch_full_path);
      }
    });
  }

  const treeoptions = computed(() => {
    const valueList = list_to_tree(cloneDeep(options.map((i) => i._item)), (node) => {
      return {
        _item: node,
        parentId: node.parentId,
        title: node.name,
        value: node.id,
        children: node.children,
      };
    });
    deepDepts(valueList);
    return valueList;
  });

  function readonlyCallback(val) {
    if (val) {
      if (dataRelationShip?.platformType === PlatformEnum.INTEGRATION_PAAS_DP) {
        return val;
      }
      return renderUtils.getLabJsonValue(props.formData, field) || val;
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
  :deep(.ant-select.department-select) {
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
