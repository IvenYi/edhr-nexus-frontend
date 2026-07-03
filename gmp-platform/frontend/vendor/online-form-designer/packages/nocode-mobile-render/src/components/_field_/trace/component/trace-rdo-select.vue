<template>
  <NocodeField
    :class="['field-select']"
    @click-input="openPopup"
    v-model="value"
    v-bind="$attrs"
    :placeholder="_placeholder"
    :label="label"
  >
    <template #label-left>
      <slot name="label-left"></slot>
    </template>
    <template #input>
      <TreeSelect
        v-model:selectedIds="selectedIds"
        :controller="controller"
        :placeholder="_placeholder"
      >
        <template #value-label="{ selectedNodes }">
          <span v-for="node in selectedNodes" :key="node.id">
            {{ `${node._item.name_}:${node._item.__LABEL__}` }}
          </span>
        </template>
        <template #node-label="{ node }">
          <span>
            {{ node.name }}
            <span v-if="node._item.default_" class="version gct-custom-tag ml8px">默认</span>
          </span>
        </template>
      </TreeSelect>
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="trace-rdo-select">
  import { computed, reactive, defineComponent, watch, ref, watchEffect } from 'vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useWidgetStaticAttrs, renderUtils } from '@gct/nocode-base';
  import type { ITrace } from '@gct/nocode-base';
  import { NocodeField, TreeSelect } from '../../../_common_';
  import { i18n } from '@mobile/locales/setupI18n';

  import { TraceRdoSelectController } from '../hooks/trace-rdo-select';

  const { t } = i18n.global;

  const searchFieldMap = {
    [FIELD_TYPE.PRODUCT]: 'name_',
    [FIELD_TYPE.SCRAP_MATERIAL]: 'name_',
  };

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: ITrace;
      formData: Object;
      label?: string;
      placeholder?: string;
    }>(),
    {},
  );

  const emit = defineEmits(['update:modelValue', 'change']);

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const _placeholder = computed(() => {
    return props.placeholder ?? t('sys.pleaseSelectSth', { sth: props.label ?? '' });
  });

  const { field, modelKey, refModelKey, fieldType } = useWidgetStaticAttrs(props.widget);

  const controller = new TraceRdoSelectController({
    field,
    modelKey,
    refModelKey,
    queryName: `${searchFieldMap[fieldType]}.like`,
  });

  const changeLabel = () => {
    const labelValue = controller.state.selectedNodes
      .map((node) => `${node._item.name_}:${node._item.__LABEL__}`)
      .join(',');
    props.formData[`${field}_lb_`] = labelValue;
  };

  const selectedIds = computed<any>({
    get() {
      return props.modelValue ? [props.modelValue] : [];
    },
    set(value?: string[]) {
      if (!value) {
        emit('update:modelValue', undefined);
      }
      emit('update:modelValue', (value as string[])!.join(','));
      emit('change');
      changeLabel();
    },
  });
</script>

<style scoped lang="less">
  .search-more {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 24px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    border-top: 1px solid #e9e9e9;
    margin-top: 4px;
    padding-top: 4px;
  }

  .cell-trace-rdo-select {
    width: var(--cmp-width, 100%);
    min-width: 30px;
    vertical-align: middle;
    :deep(.ant-select-selector) {
      height: 28px;
      padding: 0 2px;
      border-radius: 2px !important;

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
    :deep(.ant-select-arrow) {
      right: 4px;
    }

    :deep(.ant-select-clear) {
      right: 4px;
    }

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }
  }
</style>
